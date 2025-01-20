import { ROLE as R } from "#middlewares/session.middleware.js";

import wService from "#services/workspace.service.js";


export async function upsertWorkspace(_req, res) {
  try {
    const { userId } = _req.session.user;
    let { workspace } = _req.body;
    const { workspaceOid, title, projectJson } = workspace;

    const workspaceData = {
      ownerId: userId,
      title: title,
      projectJson: projectJson,
      thumbnail: _req.file.path,
    }

    if (workspaceOid) {
      const isOwner = await wService.isOwner(userId, workspaceOid);
      if (isOwner) {
        await wService.updateWorkspace(workspaceOid, workspaceData);
      }
      else {
        return res.sendStatus(403);
      }
    }
    else {
      workspace = await wService.createWorkspace(workspaceData);
    }
    
    return res.send({ workspace });
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
}

export async function updateWorkspaceInfo(req, res) {
  try {
    const { userId } = req.session.user;

    const { workspace } = req.body;
    const { workspaceOid, introduction, description } = workspace;

    const workspaceData = {
      introduction: introduction,
      description: description,
    }
    const isOwner = await wService.isOwner(userId, workspaceOid);
    
    if (isOwner) {
      await wService.updateWorkspace(workspaceOid, workspaceData);
      return res.sendStatus(200);
    }
    else {
      return res.sendStatus(403);
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
}

export async function getWorkspace(req, res) {
  try {
    const { userId, role } = req.session.user; 
		const { workspaceOid } = req.params;

    const workspace = await wService.findWorkspace(workspaceOid);
    if (
      workspace.isPublic || 
      [R.ADMIN, R.TEACHER].includes(role) || 
      workspace.ownerId === userId
    ) {
      return res.send({ workspace });
    }
    else {
      return res.sendStatus(403);
    }

  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
}

export async function deleteWorkspace(req, res) {
  try {
		const { userId, role } = req.session.user;
		const { workspaceOid } = req.params;

    const isOwner = await wService.isOwner(userId, workspaceOid);
    if ([R.ADMIN, R.TEACHER].includes(role) || isOwner) {
      await wService.deleteWorkspace(workspaceOid);
      return res.sendStatus(200);
    }
    else {
      return res.sendStatus(403);
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
}

export async function updatePublic(req, res) {
  try {
		const { userId, role } = req.session.user;
		const { workspaceOid } = req.params;
		const { isPublic } = req.body;
    
    const isOwner = await wService.isOwner(userId, workspaceOid);
    if ([R.ADMIN, R.TEACHER].includes(role) || isOwner) {
      await wService.updateWorkspace(workspaceOid, { isPublic });
      return res.sendStatus(200);
    }
    else {
      return res.sendStatus(403);
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
}