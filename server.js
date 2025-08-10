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

// Minion ID Parameter
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

// Idea ID Parameter
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

// Work ID Parameter
apiRouter.param("workId", (req, res, next, id) => {
    const minion = req.minion;
    const currentJob = db
        .getAllFromDatabase("work")
        .filter((job) => job.minionId === minion.id && job.id === id);

    if (currentJob !== null && Object.entries(currentJob).length > 0) {
        req.workJob = currentJob[0];
        next();
    } else {
        const err = new Error("Work not found");
        err.status = 400;
        next(err);
    }
});

// =================================================== \\
// ================== MINIONS ROUTES ================== \\

// Get all minions route
apiRouter.get("/minions", (req, res, next) => {
    res.status(200).send(db.getAllFromDatabase("minions"));
});

// Get Minion route by ID
apiRouter.get("/minions/:minionId", (req, res, next) => {
    res.send(req.minion);
});

// Put/Update route of Minion by ID
apiRouter.put("/minions/:minionId", (req, res, next) => {
    let oldMinion = req.minion;
    oldMinion = req.body;
    oldMinion.id = req.minion.id;
    const updatedMinion = db.updateInstanceInDatabase("minions", oldMinion);

    res.send(updatedMinion);
});

// Post/Add new minions to database
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

// Delete route for removing Minion by ID
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

// Get all Ideas route
apiRouter.get("/ideas", (req, res, next) => {
    res.status(200).send(db.getAllFromDatabase("ideas"));
});

// Get Idea route by ID
apiRouter.get("/ideas/:ideaId", (req, res, next) => {
    res.send(req.idea);
});

// Put/Update route of Idea by ID
apiRouter.put("/ideas/:ideaId", (req, res, next) => {
    let oldIdea = req.idea;
    oldIdea = req.body;
    oldIdea.id = req.idea.id;
    const updatedIdea = db.updateInstanceInDatabase("ideas", oldIdea);

    res.send(updatedIdea);
});

// Post/Add new Ideas to database, using checkMillionDollarIdea middlewear to verify if the idea > $ 1 000 000
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

// Delete route for removing Idea by ID
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

// Get all Meetings route
apiRouter.get("/meetings", (req, res, next) => {
    res.status(200).send(db.getAllFromDatabase("meetings"));
});

// Post/Add new Meetings to database.
apiRouter.post("/meetings", (req, res, next) => {
    const newMeeting = db.createMeeting();
    db.addToDatabase("meetings", newMeeting);
    res.status(201).send(newMeeting);
});

// Delete route for removing all Meetings
apiRouter.delete("/meetings", (req, res, next) => {
    db.deleteAllFromDatabase("meetings");
    res.status(204).send();
});

// =================================================== \\
// ================== WORK ROUTES ================== \\

// Get all Work route
apiRouter.get("/work", (req, res, next) => {
    res.status(200).send(db.getAllFromDatabase("work"));
});

// Get all current Work route of Minion
apiRouter.get("/minions/:minionId/work", (req, res, next) => {
    const minion = req.minion;

    const minionWork = db
        .getAllFromDatabase("work")
        .filter((data) => data.minionId === minion.id);
    res.status(200).send(minionWork);
});

// Post/Add new Work for the Minion to database
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

// Put/Update route of Minion Work by ID
apiRouter.put("/minions/:minionId/work/:workId", (req, res, next) => {
    console.log(req.workJob);
    const newJob = {
        id: req.workJob.id,
        title: req.body.title,
        description: req.body.description,
        hours: req.body.hours,
        minionId: req.workJob.minionId,
    };

    db.updateInstanceInDatabase("work", newJob);
    res.status(200).send(newJob);
});

// Delete route for removing Work of Minion by Work ID
apiRouter.delete("/minions/:minionId/work/:workId", (req, res, next) => {
    if (db.deleteFromDatabasebyId("work", req.workJob.id)) {
        res.status(204).send();
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
