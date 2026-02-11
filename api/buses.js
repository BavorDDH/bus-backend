// api/buses.js
module.exports = (req, res) => {
  try {
    return res.status(200).json({ message: "Function works!" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};