import Event from "../../models/event.model";

import logger from "../../modules/winston";

class EventHelper {
  static async updateUploadsState(userId, experimentId, uploadStatus) {
    logger.info(`#updateUploadsState: userId: ${userId}`);
    const existingEvent = await Event.getByUserId(userId);
    logger.info(`#updateUploadsState: existingEvent: ${JSON.stringify(existingEvent, null, 2)}`);
    const event = existingEvent ? existingEvent : new Event();
    logger.info(`#updateUploadsState: event: ${JSON.stringify(event, null, 2)}`);
    event.userId = userId;
    const openUpload = event.openUploads.find(item => {
      logger.info(
        `Looking for ${item.id} ${typeof item.id} === ${experimentId} ${typeof experimentId}`
      );
      return item.id === experimentId;
    });
    logger.info(`#updateUploadsState: openUpload: ${JSON.stringify(openUpload, null, 2)}`);
    if (openUpload) {
      // remove the existing entry
      const index = event.openUploads.indexOf(openUpload);
      event.openUploads.splice(index, 1);
      logger.info(`#updateUploadsState: entry removed ${event.openUploads.length}`);
    }
    // add to the array
    event.openUploads.push({
      id: experimentId,
      ...uploadStatus
    });
    logger.info(`#updateUploadsState: new entry added ${event.openUploads.length}, saving ...`);

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
