import EventProgress from "../../../src/server/helpers/events/EventProgress";

describe("EventProgress", () => {
  beforeEach(done => {
    EventProgress.clear();
    done();
  });
  describe("#update", () => {
    describe("#when no status exists", () => {
      it("should update status", done => {
        EventProgress.update("5e1c7caaa88b3c001032b14e", {
          id: "5e1c7caaa88b3c001032b14e",
          provider: "dropbox",
          size: 14515182,
          totalSize: 452248119,
          fileLocation: "/1/view/1jr5u6otmygxz27/RIF_monoresistant.fastq.gz"
        });

        const status = EventProgress.get("5e1c7caaa88b3c001032b14e");
        expect(status.id).toEqual("5e1c7caaa88b3c001032b14e");
        expect(status.provider).toEqual("dropbox");
        expect(status.size).toEqual(14515182);
        expect(status.totalSize).toEqual(452248119);
        expect(status.fileLocation).toEqual("/1/view/1jr5u6otmygxz27/RIF_monoresistant.fastq.gz");

        done();
      });
    });
    describe("#when status exists", () => {
      it("should update status", done => {
        EventProgress.update("5e1c7caaa88b3c001032b14e", {
          id: "5e1c7caaa88b3c001032b14e",
          provider: "dropbox",
          size: 14515182,
          totalSize: 452248119,
          fileLocation: "/1/view/1jr5u6otmygxz27/RIF_monoresistant.fastq.gz"
        });

        EventProgress.update("5e1c7caaa88b3c001032b14e", {
          id: "5e1c7caaa88b3c001032b14e",
          provider: "box.net",
          size: 39712873,
          totalSize: 4568045986,
          fileLocation: "/1/view/1jr5u6otmygxz27/IHN_monoresistant.fastq.gz"
        });

        const status = EventProgress.get("5e1c7caaa88b3c001032b14e");
        expect(status.id).toEqual("5e1c7caaa88b3c001032b14e");
        expect(status.provider).toEqual("box.net");
        expect(status.size).toEqual(39712873);
        expect(status.totalSize).toEqual(4568045986);
        expect(status.fileLocation).toEqual("/1/view/1jr5u6otmygxz27/IHN_monoresistant.fastq.gz");

        done();
      });
    });
  });
  describe("#diff", () => {
    describe("#when no status exists", () => {
      it("should calculate from 0", done => {
        const percentageDifference = EventProgress.diff("5e1c7caaa88b3c001032b14e", {
          id: "5e1c7caaa88b3c001032b14e",
          provider: "dropbox",
          size: 124700800,
          totalSize: 452248119,
          fileLocation: "/1/view/1jr5u6otmygxz27/RIF_monoresistant.fastq.gz"
        });
        expect(percentageDifference.toFixed(2)).toEqual("27.57");
        done();
      });
    });
    describe("#when status exists", () => {
      describe("#when status is valid", () => {
        it("should return the difference", done => {
          EventProgress.update("5e1c7caaa88b3c001032b14e", {
            id: "5e1c7caaa88b3c001032b14e",
            provider: "dropbox",
            size: 14515182,
            totalSize: 452248119,
            fileLocation: "/1/view/1jr5u6otmygxz27/RIF_monoresistant.fastq.gz"
          });
          const percentageDifference = EventProgress.diff("5e1c7caaa88b3c001032b14e", {
            id: "5e1c7caaa88b3c001032b14e",
            provider: "dropbox",
            size: 124700800,
            totalSize: 452248119,
            fileLocation: "/1/view/1jr5u6otmygxz27/RIF_monoresistant.fastq.gz"
          });
          expect(percentageDifference.toFixed(2)).toEqual("24.36");
          done();
        });
      });
      describe("#when status is not valid", () => {
        it("should return 0", done => {
          EventProgress.update("5e1c7caaa88b3c001032b14e", {
            id: "5e1c7caaa88b3c001032b14e",
            provider: "dropbox",
            size: 14515182,
            totalSize: 452248119,
            fileLocation: "/1/view/1jr5u6otmygxz27/RIF_monoresistant.fastq.gz"
          });
          const percentageDifference = EventProgress.diff("5e1c7caaa88b3c001032b14e", {});
          expect(percentageDifference.toFixed(2)).toEqual("0.00");
          done();
        });
      });
    });
  });
});
