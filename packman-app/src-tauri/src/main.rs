#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::Serialize;
use serde_json::Value;
use std::env;
use std::fs::{self, OpenOptions};
use std::io::Write;
use std::path::{Path, PathBuf};
use std::process::Command;
use std::sync::Mutex;
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Default)]
struct PermissionState {
    persist_scopes: Mutex<bool>,
}

#[derive(Serialize)]
struct HealthResponse {
    status: String,
    persist_scopes: bool,
}

#[tauri::command]
fn set_persist_scopes(
    state: tauri::State<'_, PermissionState>,
    enabled: bool,
) -> Result<(), String> {
    let mut guard = state
        .persist_scopes
        .lock()
        .map_err(|_| String::from("Failed to lock permission state"))?;
    *guard = enabled;
    Ok(())
}

#[tauri::command]
fn app_health(state: tauri::State<'_, PermissionState>) -> Result<HealthResponse, String> {
    let guard = state
        .persist_scopes
        .lock()
        .map_err(|_| String::from("Failed to lock permission state"))?;

    Ok(HealthResponse {
        status: String::from("ok"),
        persist_scopes: *guard,
    })
}

fn detect_workspace_root() -> Result<PathBuf, String> {
    fn find_workspace_root(start: &Path) -> Option<PathBuf> {
        let mut probe = start;

        loop {
            let has_workspace_marker = probe.join("pnpm-workspace.yaml").exists();
            let has_cli_package = probe.join("packman-cli").join("package.json").exists();

            if has_workspace_marker && has_cli_package {
                return Some(probe.to_path_buf());
            }

            match probe.parent() {
                Some(parent) => {
                    probe = parent;
                }
                None => {
                    return None;
                }
            }
        }
    }

    if let Ok(explicit_root) = std::env::var("PACKMAN_WORKSPACE_ROOT") {
        let candidate = PathBuf::from(explicit_root);
        if candidate.join("pnpm-workspace.yaml").exists() {
            return Ok(candidate);
        }
    }

    let current = std::env::current_dir().map_err(|e| e.to_string())?;
    if let Some(root) = find_workspace_root(current.as_path()) {
        return Ok(root);
    }

    if let Ok(exe_path) = std::env::current_exe() {
        if let Some(exe_parent) = exe_path.parent() {
            if let Some(root) = find_workspace_root(exe_parent) {
                return Ok(root);
            }
        }
    }

    Err(String::from("Failed to resolve workspace root"))
}

fn create_unique_trial_workspace(parent: &Path, prefix: Option<String>) -> Result<PathBuf, String> {
    if !parent.exists() {
        return Err(String::from("Parent path does not exist"));
    }
    if !parent.is_dir() {
        return Err(String::from("Parent path must be a directory"));
    }

    let base_prefix = prefix
        .unwrap_or_else(|| String::from("packman-trial"))
        .trim()
        .to_string();
    let safe_prefix = if base_prefix.is_empty() {
        String::from("packman-trial")
    } else {
        base_prefix
    };

    let millis = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|e| e.to_string())?
        .as_millis();

    let mut candidate = parent.join(format!("{}-{}", safe_prefix, millis));
    let mut counter = 1_u32;

    while candidate.exists() {
        candidate = parent.join(format!("{}-{}-{}", safe_prefix, millis, counter));
        counter += 1;
    }

    std::fs::create_dir_all(&candidate).map_err(|e| e.to_string())?;

    let vscode_dir = candidate.join(".vscode");
    std::fs::create_dir_all(&vscode_dir).map_err(|e| e.to_string())?;

    let workspace_file = candidate.join("packman-trial.code-workspace");
    let workspace_payload = serde_json::json!({
        "folders": [
            {
                "path": "."
            }
        ],
        "settings": {
            "files.exclude": {
                "**/.DS_Store": true
            }
        }
    });
    std::fs::write(
        &workspace_file,
        serde_json::to_string_pretty(&workspace_payload).map_err(|e| e.to_string())?,
    )
    .map_err(|e| e.to_string())?;

    Ok(candidate)
}

fn detect_default_workspace_parent() -> PathBuf {
    if let Ok(home) = env::var("HOME") {
        let home_path = PathBuf::from(&home);
        let desktop_projects = home_path.join("Desktop").join("Projects");
        if desktop_projects.exists() {
            return desktop_projects;
        }
        let documents = home_path.join("Documents");
        if documents.exists() {
            return documents;
        }

        if let Ok(workspace_root) = detect_workspace_root() {
            return workspace_root;
        }

        return home_path;
    }

    if let Ok(workspace_root) = detect_workspace_root() {
        return workspace_root;
    }

    PathBuf::from(".")
}

fn detect_default_global_profile_root() -> PathBuf {
    #[cfg(target_os = "windows")]
    {
        if let Ok(app_data) = env::var("APPDATA") {
            return PathBuf::from(app_data).join("Packman").join("profile");
        }
    }

    #[cfg(target_os = "macos")]
    {
        if let Ok(home) = env::var("HOME") {
            return PathBuf::from(home)
                .join("Library")
                .join("Application Support")
                .join("Packman")
                .join("profile");
        }
    }

    #[cfg(all(not(target_os = "windows"), not(target_os = "macos")))]
    {
        if let Ok(xdg_config_home) = env::var("XDG_CONFIG_HOME") {
            return PathBuf::from(xdg_config_home)
                .join("packman")
                .join("profile");
        }
    }

    if let Ok(home) = env::var("HOME") {
        return PathBuf::from(home)
            .join(".config")
            .join("packman")
            .join("profile");
    }

    PathBuf::from(".").join("packman-profile")
}

fn debug_log_path() -> PathBuf {
    if let Ok(explicit) = env::var("PACKMAN_DEBUG_LOG_PATH") {
        return PathBuf::from(explicit);
    }

    if let Ok(workspace_root) = detect_workspace_root() {
        return workspace_root
            .join(".packman-debug")
            .join("packman-app.log");
    }

    env::temp_dir().join("packman-app.log")
}

fn append_debug_log(message: &str) {
    let path = debug_log_path();
    if let Some(parent) = path.parent() {
        let _ = fs::create_dir_all(parent);
    }

    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_secs())
        .unwrap_or(0);

    if let Ok(mut file) = OpenOptions::new().create(true).append(true).open(path) {
        let _ = writeln!(file, "[{}] {}", timestamp, message);
    }
}

fn with_debug_path(value: Value) -> Value {
    let path = debug_log_path().to_string_lossy().to_string();
    if let Value::Object(mut map) = value {
        map.insert(String::from("_debugLogPath"), Value::String(path));
        Value::Object(map)
    } else {
        serde_json::json!({
            "ok": true,
            "data": value,
            "_debugLogPath": path
        })
    }
}

#[tauri::command]
fn run_packman(command: String, args: Vec<String>) -> Result<Value, String> {
    let workspace_root = detect_workspace_root()?;
    let invoke_cwd = workspace_root.to_string_lossy().to_string();
    append_debug_log(&format!(
        "run_packman start command={} args={:?} cwd={}",
        command, args, invoke_cwd
    ));

    let mut cmd = Command::new("pnpm");
    cmd.current_dir(workspace_root)
        .env("PACKMAN_INVOKE_CWD", invoke_cwd)
        .arg("-s")
        .arg("--filter")
        .arg("packman-cli")
        .arg("exec")
        .arg("node")
        .arg("dist/index.js")
        .arg(&command);

    for arg in args {
        cmd.arg(arg);
    }

    let output = cmd.output().map_err(|e| e.to_string())?;
    let stdout = String::from_utf8(output.stdout).map_err(|e| e.to_string())?;
    let stderr = String::from_utf8(output.stderr).map_err(|e| e.to_string())?;
    let parsed_stdout = serde_json::from_str::<Value>(&stdout).ok();
    append_debug_log(&format!(
        "run_packman finish command={} success={} exit_code={:?} stdout_len={} stderr_len={}",
        command,
        output.status.success(),
        output.status.code(),
        stdout.len(),
        stderr.len()
    ));

    if !output.status.success() {
        if let Some(parsed) = parsed_stdout {
            append_debug_log("run_packman returned parsed JSON error payload");
            return Ok(with_debug_path(parsed));
        }

        let stderr_trimmed = stderr.trim();
        let stdout_trimmed = stdout.trim();
        let detail = if !stderr_trimmed.is_empty() {
            stderr_trimmed.to_string()
        } else if !stdout_trimmed.is_empty() {
            stdout_trimmed.to_string()
        } else {
            format!("exit code {}", output.status)
        };

        append_debug_log(&format!(
            "run_packman returned synthesized error payload detail={}",
            detail
        ));
        return Ok(with_debug_path(serde_json::json!({
            "ok": false,
            "command": command,
            "error": format!("packman command failed: {}", detail),
            "stdout": stdout,
            "stderr": stderr,
            "exitCode": output.status.code()
        })));
    }

    if let Some(parsed) = parsed_stdout {
        return Ok(with_debug_path(parsed));
    }

    Ok(with_debug_path(serde_json::json!({
        "ok": true,
        "command": command,
        "stdout": stdout,
        "stderr": stderr,
        "format": "text"
    })))
}

#[tauri::command]
fn create_trial_workspace(parent_path: String, prefix: Option<String>) -> Result<String, String> {
    append_debug_log(&format!(
        "create_trial_workspace parent_path={} prefix={:?}",
        parent_path, prefix
    ));
    let parent = PathBuf::from(parent_path);
    let candidate = create_unique_trial_workspace(&parent, prefix)?;

    candidate
        .to_str()
        .map(|s| s.to_string())
        .ok_or_else(|| String::from("Failed to encode workspace path"))
}

#[tauri::command]
fn seed_trial_workspace() -> Result<String, String> {
    append_debug_log("seed_trial_workspace start");
    let workspace_root = detect_workspace_root()?;
    let trial_parent = workspace_root.join(".packman-trial-workspaces");
    std::fs::create_dir_all(&trial_parent).map_err(|e| e.to_string())?;
    let candidate = create_unique_trial_workspace(&trial_parent, None)?;

    candidate
        .to_str()
        .map(|s| s.to_string())
        .ok_or_else(|| String::from("Failed to encode workspace path"))
}

#[tauri::command]
fn get_default_workspace_parent() -> Result<String, String> {
    let parent = detect_default_workspace_parent();
    append_debug_log(&format!(
        "get_default_workspace_parent resolved={} ",
        parent.to_string_lossy()
    ));
    parent
        .to_str()
        .map(|s| s.to_string())
        .ok_or_else(|| String::from("Failed to encode default workspace parent path"))
}

#[tauri::command]
fn get_default_global_profile_root() -> Result<String, String> {
    let root = detect_default_global_profile_root();
    append_debug_log(&format!(
        "get_default_global_profile_root resolved={} ",
        root.to_string_lossy()
    ));
    std::fs::create_dir_all(&root).map_err(|e| e.to_string())?;
    root.to_str()
        .map(|s| s.to_string())
        .ok_or_else(|| String::from("Failed to encode global profile root path"))
}

fn is_allowed_trial_workspace(path: &Path) -> bool {
    path.file_name()
        .and_then(|name| name.to_str())
        .map(|name| name.starts_with("packman-trial"))
        .unwrap_or(false)
}

fn is_macos_junk_file(path: &Path) -> bool {
    path.file_name()
        .and_then(|name| name.to_str())
        .map(|name| name == ".DS_Store" || name.starts_with("._"))
        .unwrap_or(false)
}

fn is_macos_junk_dir(path: &Path) -> bool {
    path.file_name()
        .and_then(|name| name.to_str())
        .map(|name| name == "__MACOSX")
        .unwrap_or(false)
}

fn clean_macos_junk_recursive(
    current: &Path,
    root: &Path,
    removed: &mut Vec<String>,
) -> Result<(), String> {
    if current.is_file() {
        if is_macos_junk_file(current) {
            std::fs::remove_file(current).map_err(|e| e.to_string())?;
            let relative = current
                .strip_prefix(root)
                .ok()
                .map(|p| p.to_string_lossy().to_string())
                .unwrap_or_else(|| current.to_string_lossy().to_string());
            removed.push(relative);
        }
        return Ok(());
    }

    if current.is_dir() {
        if is_macos_junk_dir(current) {
            std::fs::remove_dir_all(current).map_err(|e| e.to_string())?;
            let relative = current
                .strip_prefix(root)
                .ok()
                .map(|p| p.to_string_lossy().to_string())
                .unwrap_or_else(|| current.to_string_lossy().to_string());
            removed.push(relative);
            return Ok(());
        }

        let entries = std::fs::read_dir(current).map_err(|e| e.to_string())?;
        for entry in entries {
            let entry = entry.map_err(|e| e.to_string())?;
            let child_path = entry.path();
            clean_macos_junk_recursive(&child_path, root, removed)?;
        }
    }

    Ok(())
}

fn find_workspace_file_in_dir(dir: &Path) -> Result<Option<PathBuf>, String> {
    let entries = std::fs::read_dir(dir).map_err(|e| e.to_string())?;
    for entry in entries {
        let entry = entry.map_err(|e| e.to_string())?;
        let entry_path = entry.path();
        if !entry_path.is_file() {
            continue;
        }

        let is_workspace = entry_path
            .file_name()
            .and_then(|name| name.to_str())
            .map(|name| name.ends_with(".code-workspace"))
            .unwrap_or(false);
        if is_workspace {
            return Ok(Some(entry_path));
        }
    }

    Ok(None)
}

#[tauri::command]
fn probe_workspace_file(target_path: String) -> Result<Value, String> {
    append_debug_log(&format!("probe_workspace_file target_path={}", target_path));
    let target = PathBuf::from(&target_path);

    if !target.exists() {
        return Ok(with_debug_path(serde_json::json!({
            "ok": false,
            "error": "Target path does not exist",
            "exists": false
        })));
    }

    if !target.is_dir() {
        return Ok(with_debug_path(serde_json::json!({
            "ok": false,
            "error": "Target path must be a directory",
            "exists": false
        })));
    }

    let workspace_file = find_workspace_file_in_dir(&target)?;
    if let Some(file) = workspace_file {
        return Ok(with_debug_path(serde_json::json!({
            "ok": true,
            "exists": true,
            "path": file.to_string_lossy().to_string()
        })));
    }

    Ok(with_debug_path(serde_json::json!({
        "ok": true,
        "exists": false
    })))
}

#[tauri::command]
fn create_workspace_file(target_path: String, file_name: Option<String>) -> Result<Value, String> {
    append_debug_log(&format!(
        "create_workspace_file target_path={} file_name={:?}",
        target_path, file_name
    ));
    let target = PathBuf::from(&target_path);

    if !target.exists() {
        return Ok(with_debug_path(serde_json::json!({
            "ok": false,
            "error": "Target path does not exist"
        })));
    }

    if !target.is_dir() {
        return Ok(with_debug_path(serde_json::json!({
            "ok": false,
            "error": "Target path must be a directory"
        })));
    }

    if let Some(existing) = find_workspace_file_in_dir(&target)? {
        return Ok(with_debug_path(serde_json::json!({
            "ok": true,
            "created": false,
            "path": existing.to_string_lossy().to_string()
        })));
    }

    let desired_name = file_name
        .unwrap_or_else(|| String::from("packman.code-workspace"))
        .trim()
        .to_string();
    let final_name = if desired_name.is_empty() {
        String::from("packman.code-workspace")
    } else if desired_name.ends_with(".code-workspace") {
        desired_name
    } else {
        format!("{}.code-workspace", desired_name)
    };

    let workspace_path = target.join(final_name);
    let payload = serde_json::json!({
        "folders": [
            {
                "path": "."
            }
        ],
        "settings": {
            "files.exclude": {
                "**/.DS_Store": true
            }
        }
    });
    std::fs::write(
        &workspace_path,
        serde_json::to_string_pretty(&payload).map_err(|e| e.to_string())?,
    )
    .map_err(|e| e.to_string())?;

    Ok(with_debug_path(serde_json::json!({
        "ok": true,
        "created": true,
        "path": workspace_path.to_string_lossy().to_string()
    })))
}

#[tauri::command]
fn clean_macos_junk(root_path: String) -> Result<Value, String> {
    append_debug_log(&format!("clean_macos_junk root_path={}", root_path));
    let root = PathBuf::from(&root_path);
    if !root.exists() {
        return Ok(with_debug_path(serde_json::json!({
            "ok": false,
            "error": "Source path does not exist",
            "removed": [],
            "removedCount": 0
        })));
    }

    if !root.is_dir() {
        return Ok(with_debug_path(serde_json::json!({
            "ok": false,
            "error": "Source path must be a directory",
            "removed": [],
            "removedCount": 0
        })));
    }

    let mut removed: Vec<String> = Vec::new();
    clean_macos_junk_recursive(&root, &root, &mut removed)?;
    append_debug_log(&format!("clean_macos_junk removed_count={}", removed.len()));

    Ok(with_debug_path(serde_json::json!({
        "ok": true,
        "removed": removed,
        "removedCount": removed.len()
    })))
}

#[tauri::command]
fn open_path_in_file_manager(path: String) -> Result<(), String> {
    append_debug_log(&format!("open_path_in_file_manager path={}", path));
    let target = PathBuf::from(path);
    if !target.exists() {
        return Err(String::from("Path does not exist"));
    }

    #[cfg(target_os = "macos")]
    let mut cmd = {
        let mut command = Command::new("open");
        command.arg(&target);
        command
    };

    #[cfg(target_os = "windows")]
    let mut cmd = {
        let mut command = Command::new("explorer");
        command.arg(&target);
        command
    };

    #[cfg(all(not(target_os = "macos"), not(target_os = "windows")))]
    let mut cmd = {
        let mut command = Command::new("xdg-open");
        command.arg(&target);
        command
    };

    cmd.spawn().map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn workspace_path_exists(path: String) -> Result<bool, String> {
    let exists = PathBuf::from(&path).exists();
    append_debug_log(&format!(
        "workspace_path_exists path={} exists={}",
        path, exists
    ));
    Ok(exists)
}

#[tauri::command]
fn cleanup_trial_workspace(path: String) -> Result<(), String> {
    append_debug_log(&format!("cleanup_trial_workspace path={}", path));
    let target = PathBuf::from(path);
    if !target.exists() {
        return Ok(());
    }
    if !target.is_dir() {
        return Err(String::from("Target path must be a directory"));
    }
    if !is_allowed_trial_workspace(&target) {
        return Err(String::from(
            "Refusing cleanup: only directories starting with 'packman-trial' are allowed",
        ));
    }

    std::fs::remove_dir_all(target).map_err(|e| e.to_string())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .manage(PermissionState::default())
        .invoke_handler(tauri::generate_handler![
            set_persist_scopes,
            app_health,
            run_packman,
            create_trial_workspace,
            seed_trial_workspace,
            get_default_workspace_parent,
            get_default_global_profile_root,
            clean_macos_junk,
            probe_workspace_file,
            create_workspace_file,
            open_path_in_file_manager,
            workspace_path_exists,
            cleanup_trial_workspace
        ])
        .run(tauri::generate_context!())
        .expect("error while running packman app");
}
