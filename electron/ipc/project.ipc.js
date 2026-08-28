import { ipcMain } from 'electron';
import { projectService } from '../services/project.service.js';

export function registerProjectIPC() {
  ipcMain.handle('project:get-recent', async () => {
    return await projectService.getRecentProjects();
  });

  ipcMain.handle('project:create', async (event, { path: projectDir, metadata }) => {
    return await projectService.createProject(projectDir, metadata);
  });

  ipcMain.handle('project:open', async (event, projectDir) => {
    return await projectService.openProject(projectDir);
  });
}
