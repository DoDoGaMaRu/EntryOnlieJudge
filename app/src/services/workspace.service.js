import uRepo from "#repositories/user.repository.js";
import wRepo from "#repositories/workspace.repository.js";


class WorkspaceService {
  /**
   * workspace 생성
   * @param {Object} workspaceData
   * @param {string} workspaceData.ownerId
   * @param {string} workspaceData.title
   * @param {string} workspaceData.thumbnail
   * @param {Object} workspaceData.projectJson
   */
  async createWorkspace(workspaceData) {
    const workspace = await wRepo.create(workspaceData);
    return workspace;
  }
  
  async findWorkspace(workspaceOid) {
    const workspace = await wRepo.findById(workspaceOid);
    return workspace;
  }

  /**
   * 특정 유저의 workspace조회
   * @param {string} ownerId 
   * @param {number} limit - 생략가능
   * @param {boolean} isPublic - 생략가능
   * @returns 
   */
  async findWorkspaces(ownerId, limit=null, isPublic=null) {
    const workspaces = await wRepo.find({ ownerId, isPublic }, { projectJson: 0 }, {sort: {updatedAt: -1}, limit: limit});
    return workspaces;
  }

  /**
   * 
   * @param {string} query - 검색어(title, ownerId 부분 일치)
   * @param {number} limit - 생략가능
   * @param {boolean} isPublic - 생략가능
   * @returns 
   */
  async findWorkspacesByQuery(query, limit=null, isPublic=null) {
    const workspaces = await wRepo.find({ query, isPublic }, { projectJson: 0 }, {sort: {updatedAt: -1}, limit: limit, lean: true});
    for (const ws of workspaces) {
      ws.user = await uRepo.findOneByUserId(ws.ownerId, {profileThumbnail: 1});
    }
    return workspaces;
  }

  /**
   * workspace 업데이트
   * @param {string} workspaceOid
   * @param {Object} workspaceData
   * @param {string} workspaceData.ownerId
   * @param {string} workspaceData.title
   * @param {Object} workspaceData.projectJson
   */
  async updateWorkspace(workspaceOid, workspaceData) {
    const workspace = await wRepo.findById(workspaceOid);
    if (workspace) {
      workspace.set(workspaceData);
      await wRepo.update(workspace);
    }
  }

  async deleteWorkspace(workspaceOid) {
    const workspace = await wRepo.findById(workspaceOid);
    if (workspace) {
      await wRepo.deleteById(workspace._id);
    }
  }

  async isOwner(ownerId, workspaceOid) {
    const isOwner = 0 < await wRepo.count({
      ownerId: ownerId, 
      _id: workspaceOid
    });
    return isOwner;
  }
  
}

export default new WorkspaceService();