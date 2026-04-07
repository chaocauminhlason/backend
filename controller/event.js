const EventService = require("../service/event");

const createEvent = async (req, res) => {
  try {
    const response = await EventService.createEvent(req.body);
    return res.status(200).json({
      success: true,
      event: response,
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      mes: e.message || "Có lỗi xảy ra",
    });
  }
};

const getEvents = async (req, res) => {
  try {
    const { page, limit, active } = req.query;
    const response = await EventService.getEvents({ page, limit, active });
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      success: false,
      mes: e.message || "Có lỗi xảy ra",
    });
  }
};

const getActiveEvents = async (req, res) => {
  try {
    const response = await EventService.getActiveEvents();
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      success: false,
      mes: e.message || "Có lỗi xảy ra",
    });
  }
};

const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await EventService.getEventById(id);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      success: false,
      mes: e.message || "Có lỗi xảy ra",
    });
  }
};

const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await EventService.updateEvent(id, req.body);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      success: false,
      mes: e.message || "Có lỗi xảy ra",
    });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await EventService.deleteEvent(id);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      success: false,
      mes: e.message || "Có lỗi xảy ra",
    });
  }
};

module.exports = {
  createEvent,
  getEvents,
  getActiveEvents,
  getEventById,
  updateEvent,
  deleteEvent,
};
