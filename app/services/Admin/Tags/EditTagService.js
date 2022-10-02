const moment = require("moment");

const Tags = require("../../../models/Tags");
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
    code: "ERR-EDITTAG-01",
    message: "Workspace, owner, and editor are unrelated to each other.",
  },
  2: {
    code: "ERR-EDITTAG-02",
    message: "Tag already exists.",
  },
  3: {
    code: "ERR-EDITTAG-03",
    message: "Unable to edit tag record.",
  },
};

const editTag = async body => {
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

  const existingTag = await Tags.query()
    .select("id")
    .whereNot("id", id)
    .where("owner_user_id", ownerUserId)
    .where("workspace_id", workspaceId)
    .where("name", name)
    .first();
  if (existingTag) {
    return { error: errors[2] };
  }

  const patchData = {
    name,
    updated_at: moment().format(),
  };
  if (description) {
    patchData["description"] = description;
  }

  const editedTag = await Tags.query().patchAndFetchById(id, patchData);
  if (!editedTag) {
    return { error: errors[3] };
  }

  return { tag: editedTag };
};

module.exports = {
  rules,
  editTag,
};
