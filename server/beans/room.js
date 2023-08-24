const Rooms = require("../../server/models/room");

async function c_room(req, res) {
  try {
    let { name, available } = req.body;
    let rooms = await Rooms.create({
      name,
      available,
    });
    if (!rooms) return res.status(400).send("Room data not create");

    res.status(200).json({ rooms });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function room_available(req, res) {
  try {
    let rooms = await Rooms.find({ available: { $eq: false } }).select("name");
    if (!rooms) return res.status(400).send("Room data not create");
    res.status(200).json({ rooms });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
  c_room,
  room_available,
};
