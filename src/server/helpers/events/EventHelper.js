import Event from "../../models/event.model";

class EventHelper {
  static async updateUploadsState(userId, experimentId, uploadStatus) {
    const event = (await Event.getByUserId(userId)) || new Event();
    event.userId = userId;
    const openUpload = event.openUploads.find(item => item.id === experimentId);
    if (!openUpload) {
      const index = event.openUploads.indexOf(openUpload);
      event.openUploads.splice(index, 1);
    }
    event.openUploads.push({
      id: experimentId,
      ...uploadStatus
    });
    await event.save();
  }

  static async clearUploadsState(userId, experimentId) {
    const event = (await Event.getByUserId(userId)) || new Event();
    event.userId = userId;
    const openUpload = event.openUploads.find(item => item.id === experimentId);
    if (!openUpload) {
      const index = event.openUploads.indexOf(openUpload);
      event.openUploads.splice(index, 1);
    }
    await event.save();
  }

  static async clearAnalysisState(experimentId) {
    const events = await Event.list();
    for (let event of events) {
      const open = event.openAnalysis.find(item => item.id === experimentId);
      if (open) {
        const index = event.openAnalysis.indexOf(open);
        event.openAnalysis.splice(index, 1);
        await event.save();
      }
    }
  }

  static async updateAnalysisState(userId, experimentId, fileLocation) {
    const event = (await Event.getByUserId(userId)) || new Event();
    event.userId = userId;
    const open = event.openAnalysis.find(item => item.id === experimentId);
    if (open) {
      const index = event.openAnalysis.indexOf(open);
      event.openUploads.splice(index, 1);
    }
    event.openAnalysis.push({
      id: experimentId,
      fileLocation
    });
    await event.save();
  }

  static async updateSearchesState(userId, search) {
    const event = (await Event.getByUserId(userId)) || new Event();
    event.userId = userId;
    const openSearch = event.openSearches.find(item => item.id === search.id);
    if (!openSearch) {
      const index = event.openSearches.indexOf(openSearch);
      event.openSearches.splice(index, 1);
    }
    event.openSearches.push(search);
    await event.save();
  }

  static async clearSearchesState(searchId) {
    const events = await Event.list();
    for (let event of events) {
      const open = event.openSearches.find(item => item.id === searchId);
      if (open) {
        const index = event.openSearches.indexOf(open);
        event.openSearches.splice(index, 1);
        await event.save();
      }
    }
  }
}

export default EventHelper;
