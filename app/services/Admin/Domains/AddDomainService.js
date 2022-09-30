const Domains = require("../../../models/Domains");
const Workspaces = require("../../../models/Workspaces");

const rules = {
  ownerUserId: "required|integer",
  creatorUserId: "required|integer",
  workspaceId: "required|integer",
  name: "required|string",
  description: "present|string",
};

const errors = {
  1: {
    code: "ERR-ADDDOMAIN-01",
    message: "Workspace, owner, and creator are unrelated to each other.",
  },
  2: {
    code: "ERR-ADDDOMAIN-02",
    message: "Domain already exists.",
  },
  3: {
    code: "ERR-ADDDOMAIN-03",
    message: "Unable to create domain record.",
  },
};

const addDomain = async body => {
  const { ownerUserId, creatorUserId, workspaceId, name, description } = body;

  const workspaceMember = await Workspaces.relatedQuery("members")
    .select("id")
    .for(workspaceId)
    .where("user_id", creatorUserId)
    .where("owner_user_id", ownerUserId)
    .first();
  if (!workspaceMember) {
    return { error: errors[1] };
  }

  const existingDomain = await Domains.query()
    .select("id")
    .where("owner_user_id", ownerUserId)
    .where("workspace_id", workspaceId)
    .where("name", name)
    .first();
  if (existingDomain) {
    return { error: errors[2] };
  }

  const newDomain = await Domains.query().insertAndFetch({
    owner_user_id: ownerUserId,
    creator_user_id: creatorUserId,
    workspace_id: workspaceId,
    name,
    description: description ? description : "",
  });
  if (!newDomain) {
    return { error: errors[3] };
  }

  return { domain: newDomain };
};

module.exports = {
  rules,
  addDomain,
};
