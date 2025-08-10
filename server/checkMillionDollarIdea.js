const checkMillionDollarIdea = (req, res, next) => {
    const idea = req.body;
    let weeklyRevenue = idea.weeklyRevenue || "";
    let weeks = idea.numWeeks || "";
    if (idea !== null) {
        if (
            !isNaN(parseFloat(idea.weeklyRevenue)) &&
            isFinite(idea.weeklyRevenue)
        ) {
            weeklyRevenue = parseFloat(idea.weeklyRevenue);
        } else {
            res.status(400).send();
        }
        if (!isNaN(parseFloat(idea.numWeeks)) && isFinite(idea.numWeeks)) {
            weeks = parseFloat(idea.numWeeks);
        } else {
            res.status(400).send();
        }
        const totalRevenue = weeklyRevenue * weeks;

        if (totalRevenue >= 1_000_000) {
            next();
        } else {
            res.status(400).send("Insufficiently Profitable Idea");
        }
    } else {
        res.status(400).send();
    }
};

// Leave this exports assignment so that the function can be used elsewhere
module.exports = checkMillionDollarIdea;
