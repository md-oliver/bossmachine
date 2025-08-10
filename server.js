const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const db = require("./server/db.js");

module.exports = app;

/* Do not change the following line! It is required for testing and allowing
 *  the frontend application to interact as planned with the api server
 */
const PORT = process.env.PORT || 4001;

// Add middleware for handling CORS requests from index.html
app.use(cors());

// Add middware for parsing request bodies here:
app.use(bodyParser.json());

// Mount your existing apiRouter below at the '/api' path.
const apiRouter = require("./server/api");
const checkMillionDollarIdea = require("./server/checkMillionDollarIdea.js");

app.use("/api", apiRouter);

// ==================   PARAMS    ================== \\

apiRouter.param("minionId", (req, res, next, id) => {
    const minion = db.getFromDatabaseById("minions", id);
    if (!minion || minion === null || isNaN(Number(id))) {
        const err = new Error("Minion not found");
        err.status = 404;
        next(err);
        // res.status(404).send();
    } else {
        req.minion = minion;
        // res.send(minion);
        next();
    }
});

apiRouter.param("ideaId", (req, res, next, id) => {
    const idea = db.getFromDatabaseById("ideas", id);
    if (!idea || idea === null || isNaN(Number(id))) {
        const err = new Error("Idea not found");
        err.status = 404;
        next(err);
    } else {
        req.idea = idea;
        next();
    }
});

// =================================================== \\
// ================== MINIONS ROUTES ================== \\

apiRouter.get("/minions", (req, res, next) => {
    res.status(200).send(db.getAllFromDatabase("minions"));
});

apiRouter.get("/minions/:minionId", (req, res, next) => {
    res.send(req.minion);
});

apiRouter.put("/minions/:minionId", (req, res, next) => {
    let oldMinion = req.minion;
    oldMinion = req.body;
    oldMinion.id = req.minion.id;
    const updatedMinion = db.updateInstanceInDatabase("minions", oldMinion);

    res.send(updatedMinion);
});

apiRouter.post("/minions", (req, res, next) => {
    const newMinion = {
        id: "",
        name: req.body.name,
        title: req.body.title,
        weaknesses: req.body.weaknesses,
        salary: req.body.salary,
    };
    const updatedMinion = db.addToDatabase("minions", newMinion);
    res.status(201).send(updatedMinion);
});

apiRouter.delete("/minions/:minionId", (req, res, next) => {
    const minionToDelete = req.minion;
    if (db.deleteFromDatabasebyId("minions", minionToDelete.id)) {
        res.status(204).send();
    } else {
        res.status(404).send();
    }
});

// =================================================== \\
// ================== IDEAS ROUTES ================== \\

apiRouter.get("/ideas", (req, res, next) => {
    res.status(200).send(db.getAllFromDatabase("ideas"));
});

apiRouter.get("/ideas/:ideaId", (req, res, next) => {
    res.send(req.idea);
});

apiRouter.put("/ideas/:ideaId", (req, res, next) => {
    let oldIdea = req.idea;
    oldIdea = req.body;
    oldIdea.id = req.idea.id;
    const updatedIdea = db.updateInstanceInDatabase("ideas", oldIdea);

    res.send(updatedIdea);
});

apiRouter.post("/ideas", checkMillionDollarIdea, (req, res, next) => {
    const newIdea = {
        id: "",
        name: req.body.name,
        description: req.body.description,
        weeklyRevenue: req.body.weeklyRevenue,
        numWeeks: req.body.numWeeks,
    };

    const updatedidea = db.addToDatabase("ideas", newIdea);
    res.status(201).send(updatedidea);
});

apiRouter.delete("/ideas/:ideaId", (req, res, next) => {
    const ideaToDelete = req.idea;
    if (db.deleteFromDatabasebyId("ideas", ideaToDelete.id)) {
        res.status(204).send();
    } else {
        res.status(404).send();
    }
});

// =================================================== \\
// ================== MEETINGS ROUTES ================== \\

apiRouter.get("/meetings", (req, res, next) => {
    res.status(200).send(db.getAllFromDatabase("meetings"));
});

apiRouter.post("/meetings", (req, res, next) => {
    const newMeeting = db.createMeeting();
    db.addToDatabase("meetings", newMeeting);
    res.status(201).send(newMeeting);
});

apiRouter.delete("/meetings", (req, res, next) => {
    db.deleteAllFromDatabase("meetings");
    res.status(204).send();
});

// =================================================== \\
// ================== WORK ROUTES ================== \\

apiRouter.get("/work", (req, res, next) => {
    res.status(200).send(db.getAllFromDatabase("work"));
});

apiRouter.get("/minions/:minionId/work", (req, res, next) => {
    const minion = req.minion;

    const minionWork = db
        .getAllFromDatabase("work")
        .filter((data) => data.minionId === minion.id);
    res.status(200).send(minionWork);
});

apiRouter.post("/minions/:minionId/work", (req, res, next) => {
    const minion = req.minion;
    const workPost = {
        id: "",
        title: req.body.title,
        description: req.body.description,
        hours: req.body.hours,
        minionId: minion.id,
    };

    const postJob = db.addToDatabase("work", workPost);
    res.status(201).send(postJob);
});

apiRouter.put("/minions/:minionId/work/:workId", (req, res, next) => {
    const minion = req.minion;
    const pendingJob = {
        id: req.params.workId,
        title: req.body.title,
        description: req.body.description,
        hours: req.body.hours,
        minionId: minion.id,
    };
    // let oldJob = db.getFromDatabaseById('work', req.params.workId);
    // oldJob = pendingJob;
    const updateJob = db.updateInstanceInDatabase("work", pendingJob);
    res.status(201).send(updateJob);
});

apiRouter.delete("/minions/:minionId/work/:workId", (req, res, next) => {
    const minion = req.minion;
    const jobToRemove = db
        .getAllFromDatabase("work")
        .filter(
            (job) => job.minionId === minion.id && job.id === req.params.workId
        );
    console.log(jobToRemove);
    console.log(typeof jobToRemove);

    if (jobToRemove !== null && Object.entries(jobToRemove).length > 0) {
        if (db.deleteFromDatabasebyId("work", jobToRemove[0].id)) {
            res.status(204).send();
        } else {
            res.status(400).send();
        }
    } else {
        res.status(400).send();
    }
});

// This conditional is here for testing purposes:
if (!module.parent) {
    apiRouter.use((err, req, res, next) => {
        if (!err.status) {
            err.status = 500;
        }
        console.log(err.stack);
        res.status(err.status).send(err.message);
    });

    // Add your code to start the server listening at PORT below:
    app.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
    });
}
