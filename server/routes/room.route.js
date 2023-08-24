import express from "express";
import validate from "express-validation";
import room from "../beans/room";
const router = express.Router();
import roomParams from "../params/room.params";

router.post("/roomcre", validate(roomParams.room_create), room.c_room);
router.get("/roomget", room.room_available);
// route.post('/hospitalcre',validate(authParams.login), control.c_hospital);

module.exports = router;
