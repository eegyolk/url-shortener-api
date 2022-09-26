const jwt = require("jsonwebtoken");
const { transaction } = require("objection");
const moment = require("moment");

const Users = require("../../models/Users");
const Workspaces = require("../../models/Workspaces");
const WorkspaceMembers = require("../../models/WorkspaceMembers");

const rules = {
  verificationBase64: "required",
};

const errors = {
  1: {
    code: "ERR-VERIFYACCOUNT-01",
    message: "Looks like the verification link is invalid.",
  },
  2: {
    code: "ERR-VERIFYACCOUNT-02",
    message: "Looks like the verification link has expired.",
  },
  3: {
    code: "ERR-VERIFYACCOUNT-03",
    message: "Unable to update user record.",
  },
  4: {
    code: "ERR-VERIFYACCOUNT-04",
    message: "Unable to update workspace record.",
  },
  5: {
    code: "ERR-VERIFYACCOUNT-05",
    message: "Unable to update workspace member record.",
  },
};

const validateBase64 = async verificationBase64 => {
  const user = await Users.query()
    .select("id", "email_address", "verification_token")
    .where("verification_base64", verificationBase64)
    .whereNull("verified_at");

  if (user.length === 0) {
    return { error: errors[1] };
  }

  const verificationToken = jwt.decode(user[0].verification_token);
  if (!verificationToken) {
    return { error: errors[1] };
  }

  const expiry = verificationToken.exp * 1000;
  const currentTime = Date.now();

  if (currentTime > expiry) {
    return { error: errors[2] };
  }

  return { user: user[0] };
};

const clearTokenAndCreateDefaultWorkspace = async id => {
  await transaction(
    Users,
    Workspaces,
    WorkspaceMembers,
    async (Users, Workspaces, WorkspaceMembers) => {
      const user = await Users.query()
        .patch({
          verification_token: "",
          verification_base64: "",
          verified_at: moment().format(),
          updated_at: moment().format(),
        })
        .findById(id);
      if (!user) {
        return { error: errors[3] };
      }

      const workspace = await Workspaces.query().insert({
        owner_user_id: id,
        creator_user_id: id,
        name: "Default",
        space_character: Workspaces.SPACE_CHARACTER.BLANK_SPACE,
        description: "My default workspace",
      });
      if (!workspace) {
        return { error: errors[4] };
      }

      const workspaceMember = await WorkspaceMembers.query().insert({
        workspace_id: workspace.id,
        owner_user_id: id,
        creator_user_id: id,
        user_id: id,
        role: WorkspaceMembers.ROLES.OWNER,
      });
      if (!workspaceMember) {
        return { error: errors[5] };
      }
    }
  );

  return {};
};

module.exports = {
  rules,
  validateBase64,
  clearTokenAndCreateDefaultWorkspace,
};
