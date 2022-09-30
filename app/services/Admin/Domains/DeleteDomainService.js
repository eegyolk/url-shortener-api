const Domains = require("../../../models/Domains");
const Workspaces = require("../../../models/Workspaces");

const rules = {
  ownerUserId: "required|integer",
  deletedByUserId: "required|integer",
  workspaceId: "required|integer",
  ids: "required",
};

const errors = {
  1: {
    code: "ERR-DELETEDOMAIN-01",
    message: "Workspace, owner, and editor are unrelated to each other.",
  },
};

const deleteDomain = async body => {
  const { ownerUserId, deletedByUserId, workspaceId, ids } = body;

  const workspaceMember = await Workspaces.relatedQuery("members")
    .select("id")
    .for(workspaceId)
    .where("user_id", deletedByUserId)
    .where("owner_user_id", ownerUserId)
    .first();
  if (!workspaceMember) {
    return { error: errors[1] };
  }

  const numberOfDeletedRows = await Domains.query().deleteById(ids);

  return {
    deletedCount: numberOfDeletedRows,
  };
};

module.exports = {
  rules,
  deleteDomain,
};
