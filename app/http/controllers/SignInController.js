const signIn = async function (req, res) {
  try {
    const body = req.body;
    console.log(body);
    res.status(200).json("Test 123");
  } catch (err) {
    console.error(err);
  }
};

module.exports = {
  signIn,
};
