#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::Serialize;
use serde_json::Value;
use std::path::PathBuf;
use std::process::Command;
use std::sync::Mutex;

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
fn set_persist_scopes(state: tauri::State<'_, PermissionState>, enabled: bool) -> Result<(), String> {
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
    let current = std::env::current_dir().map_err(|e| e.to_string())?;
    let root = current
        .parent()
        .ok_or_else(|| String::from("Failed to resolve workspace root"))?
        .to_path_buf();
    Ok(root)
}

#[tauri::command]
fn run_packman(command: String, args: Vec<String>) -> Result<Value, String> {
    let workspace_root = detect_workspace_root()?;
    let invoke_cwd = workspace_root.to_string_lossy().to_string();

    let mut cmd = Command::new("pnpm");
    cmd.current_dir(workspace_root)
        .env("PACKMAN_INVOKE_CWD", invoke_cwd)
        .arg("-s")
        .arg("--filter")
        .arg("packman-cli")
        .arg("exec")
        .arg("node")
        .arg("dist/index.js")
        .arg(command);

    for arg in args {
        cmd.arg(arg);
    }

    let output = cmd.output().map_err(|e| e.to_string())?;
    let stdout = String::from_utf8(output.stdout).map_err(|e| e.to_string())?;
    let stderr = String::from_utf8(output.stderr).map_err(|e| e.to_string())?;

    if !output.status.success() {
        return Err(format!("packman command failed: {}", stderr));
    }

    serde_json::from_str::<Value>(&stdout).map_err(|e| format!("invalid json output: {} / output: {}", e, stdout))
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .manage(PermissionState::default())
        .invoke_handler(tauri::generate_handler![set_persist_scopes, app_health, run_packman])
        .run(tauri::generate_context!())
        .expect("error while running packman app");
}
