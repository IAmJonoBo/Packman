import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";

export interface PackmanResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

export const api = {
  async pickDirectory(
    title: string,
    defaultPath?: string,
  ): Promise<string | null> {
    const selected = await open({
      directory: true,
      multiple: false,
      title,
      defaultPath,
    });

    if (Array.isArray(selected)) return selected[0] || null;
    return selected;
  },

  async runPackmanCommand(command: string, args: string[]): Promise<unknown> {
    try {
      console.log(`[API] Invoking run_packman: ${command}`, args);
      return await invoke("run_packman", { command, args });
    } catch (err) {
      console.error(`[API] Error invoking ${command}:`, err);
      throw err;
    }
  },

  async createTrialWorkspace(
    parentPath: string,
    prefix?: string,
  ): Promise<string> {
    return invoke<string>("create_trial_workspace", {
      parentPath,
      prefix,
    });
  },

  async seedTrialWorkspace(): Promise<string> {
    return invoke<string>("seed_trial_workspace");
  },

  async getDefaultWorkspaceParent(): Promise<string> {
    return invoke<string>("get_default_workspace_parent");
  },

  async getDefaultGlobalProfileRoot(): Promise<string> {
    return invoke<string>("get_default_global_profile_root");
  },

  async cleanMacOsJunk(path: string): Promise<unknown> {
    return invoke("clean_macos_junk", { rootPath: path });
  },

  async probeWorkspaceFile(path: string): Promise<unknown> {
    return invoke("probe_workspace_file", { targetPath: path });
  },

  async createWorkspaceFile(path: string, fileName?: string): Promise<unknown> {
    return invoke("create_workspace_file", {
      targetPath: path,
      fileName,
    });
  },

  async openPathInFileManager(path: string): Promise<void> {
    await invoke("open_path_in_file_manager", { path });
  },

  async workspacePathExists(path: string): Promise<boolean> {
    return invoke<boolean>("workspace_path_exists", { path });
  },

  async cleanupTrialWorkspace(path: string): Promise<void> {
    await invoke("cleanup_trial_workspace", { path });
  },
};
