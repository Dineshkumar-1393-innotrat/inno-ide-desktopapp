import fsPromises from 'fs/promises';
import path from 'path';
import { app } from 'electron';
import { logger } from '../utils/logger.js';

export class ProjectService {
  constructor() {
    this.recentProjectsFile = null;
  }

  getRecentProjectsFilePath() {
    if (!this.recentProjectsFile) {
      this.recentProjectsFile = path.join(app.getPath('userData'), 'recent-projects.json');
    }
    return this.recentProjectsFile;
  }

  async getRecentProjects() {
    try {
      const filePath = this.getRecentProjectsFilePath();
      await fsPromises.access(filePath);
      const data = await fsPromises.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  async addRecentProject(project) {
    try {
      const list = await this.getRecentProjects();
      const updated = [
        { ...project, lastOpened: new Date().toISOString() },
        ...list.filter(p => p.path !== project.path)
      ].slice(0, 15);

      const filePath = this.getRecentProjectsFilePath();
      await fsPromises.mkdir(path.dirname(filePath), { recursive: true });
      await fsPromises.writeFile(filePath, JSON.stringify(updated, null, 2), 'utf8');
      return updated;
    } catch (error) {
      logger.error('Error adding recent project:', error.message);
      throw error;
    }
  }

  async createProject(projectDir, metadata = {}) {
    try {
      await fsPromises.mkdir(projectDir, { recursive: true });
      const manifestPath = path.join(projectDir, 'project.json');
      const projectConfig = {
        name: metadata.name || path.basename(projectDir),
        version: metadata.version || '1.0.0',
        created: new Date().toISOString(),
        ...metadata
      };
      await fsPromises.writeFile(manifestPath, JSON.stringify(projectConfig, null, 2), 'utf8');
      await this.addRecentProject({ name: projectConfig.name, path: projectDir });
      return { success: true, project: projectConfig, path: projectDir };
    } catch (error) {
      logger.error(`Error creating project at ${projectDir}:`, error.message);
      throw error;
    }
  }

  async openProject(projectDir) {
    try {
      await fsPromises.access(projectDir);
      const manifestPath = path.join(projectDir, 'project.json');
      let manifest = null;

      try {
        const data = await fsPromises.readFile(manifestPath, 'utf8');
        manifest = JSON.parse(data);
      } catch {
        manifest = {
          name: path.basename(projectDir),
          created: new Date().toISOString()
        };
      }

      await this.addRecentProject({ name: manifest.name, path: projectDir });
      return { success: true, manifest, path: projectDir };
    } catch (error) {
      logger.error(`Error opening project at ${projectDir}:`, error.message);
      throw error;
    }
  }
}

export const projectService = new ProjectService();
