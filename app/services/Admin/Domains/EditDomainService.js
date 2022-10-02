const moment = require("moment");

const Domains = require("../../../models/Domains");
const Workspaces = require("../../../models/Workspaces");

const rules = {
  id: "required|integer",
  ownerUserId: "required|integer",
  editorUserId: "required|integer",
  workspaceId: "required|integer",
  name: "required|string",
  description: "present|string",
};

const errors = {
  1: {
    code: "ERR-EDITDOMAIN-01",
    message: "Workspace, owner, and editor are unrelated to each other.",
  },
  2: {
    code: "ERR-EDITDOMAIN-02",
    message: "Domain already exists.",
  },
  3: {
    code: "ERR-EDITDOMAIN-03",
    message: "Unable to edit domain record.",
  },
};

const editDomain = async body => {
  const { id, ownerUserId, editorUserId, workspaceId, name, description } =
    body;

  const workspaceMember = await Workspaces.relatedQuery("members")
    .select("id")
    .for(workspaceId)
    .where("user_id", editorUserId)
    .where("owner_user_id", ownerUserId)
    .first();
  if (!workspaceMember) {
    return { error: errors[1] };
  }

  const existingDomain = await Domains.query()
    .select("id")
    .whereNot("id", id)
    .where("owner_user_id", ownerUserId)
    .where("workspace_id", workspaceId)
    .where("name", name)
    .first();
  if (existingDomain) {
    return { error: errors[2] };
  }

  const patchData = {
    name,
    updated_at: moment().format(),
  };
  if (description) {
    patchData["description"] = description;
  }

  const editedDomain = await Domains.query().patchAndFetchById(id, patchData);
  if (!editedDomain) {
    return { error: errors[3] };
  }

  return { domain: editedDomain };
};

module.exports = {
  rules,
  editDomain,
};
