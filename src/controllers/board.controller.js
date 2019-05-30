'use strict';

const objectId = require('mongodb').ObjectID;

const Board = require('../domain/Board');
const Event = require('../domain/Event');

module.exports.getBoards = (req, res) => {

    const userId = req.query.userId;

    if (!/^([0-9a-fA-F]{12}|[0-9a-fA-F]{24})$/.test(userId)) {
        return res.status(400).send();
    }

    Board.aggregate([
        {
            $lookup: {
                from: 'users',
                localField: 'creator',
                foreignField: '_id',
                as: 'creator'
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'participants',
                foreignField: '_id',
                as: 'participants'
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'invited',
                foreignField: '_id',
                as: 'invited'
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'moderators',
                foreignField: '_id',
                as: 'moderators'
            }
        },
        {
            $match: { 'participants._id': { $eq: new objectId(userId) }}
        }
    ]).exec(function(err, boards){

        if (err) {
            return res.status(err.status).json(err);
        }

        return res.status(200).json(boards);

    });
};

module.exports.getBoardInvites = function(req, res) {

    const userId = req.query.userId;

    if (!/^([0-9a-fA-F]{12}|[0-9a-fA-F]{24})$/.test(userId)) {
        return res.status(400).send();
    }

    Board.aggregate([
        {
            $lookup: {
                from: 'users',
                localField: 'creator',
                foreignField: '_id',
                as: 'creator'
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'participants',
                foreignField: '_id',
                as: 'participants'
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'invited',
                foreignField: '_id',
                as: 'invited'
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'moderators',
                foreignField: '_id',
                as: 'moderators'
            }
        },
        {
            $match: { 'invited._id': { $eq: new objectId(userId) }}
        }
    ]).exec(function(err, boards){

        if (err) {
            return res.status(err.status).json(err);
        }

        return res.status(200).json(boards);

    });
};

module.exports.get = function(req, res) {

    const boardId = req.params.id;

    if (!/^([0-9a-fA-F]{12}|[0-9a-fA-F]{24})$/.test(boardId)) {
        return res.status(400).send();
    }

    Board.aggregate([
        {
            $lookup: {
                from: 'users',
                localField: 'creator',
                foreignField: '_id',
                as: 'creator'
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'participants',
                foreignField: '_id',
                as: 'participants'
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'invited',
                foreignField: '_id',
                as: 'invited'
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'moderators',
                foreignField: '_id',
                as: 'moderators'
            }
        },
        {
            $match: {
                $and: [
                    { '_id': { $eq: new objectId(boardId) }},
                    { 'participants._id': { $eq: new objectId(req.payload._id) }}
                ]
            }
        }
    ]).exec(function(err, boards){

        if (err) {
            return res.status(err.status).json(err);
        }

        if (boards.length === 0) {
            return res.status(404).send();
        }

        const board = boards[0];

        return res.status(200).json(board);

    });
};

module.exports.add = function(req, res) {
    let board = new Board();

    if (Object.keys(req.body).length === 0) {
        return res.sendStatus(400).send();
    }

    board.name = req.body.name;
    board.creator = new objectId(req.body.creator.id);
    board.isPrivate = req.body.isPrivate;
    board.moderators = req.body.moderators.map(p => new objectId(p.id));
    board.participants = req.body.participants.map(p => new objectId(p.id));
    board.invited =  req.body.invited.map(i => new objectId(i.id));
    board.save((err) => {
        if (err) {
            return res.status(err.status).json(err);
        }

        return res.status(200).send();
    });
};

module.exports.delete = function(req, res) {

    if (!/^([0-9a-fA-F]{12}|[0-9a-fA-F]{24})$/.test(req.params.id)) {
        return res.status(400).send();
    }

    const id = new objectId(req.params.id);

    Board.remove({ _id: id, creator: new objectId(req.payload._id) }, (err) => {

        if (err) {
            return res.status(400).send();
        }

        Event.remove({ board: id }, (err) => {

            if (err) {
                return res.status(err.status).json(err);
            }

            return res.status(200).send();
        });

    });
};

module.exports.update = function(req, res) {

    if (Object.keys(req.body).length === 0) {
       return res.sendStatus(400).send();
    }

    if (!/^([0-9a-fA-F]{12}|[0-9a-fA-F]{24})$/.test(req.body.id)) {
        return res.status(400).send();
    }

    Board.findOne({ _id: new objectId(req.body.id) }, (err, board) => {
        
        if (err) {
            return res.status(err.status).json(err);
        }

        if (!board) {
            return res.status(404).send();
        } 

        const userId = req.payload._id;

        if (!board.creator.equals(userId) && board.moderators.every((m) => !m.equals(userId))) {
            return res.status(403).send();
        }

        board.name = req.body.name;
        board.isPrivate = req.body.isPrivate;

        


        // need to delete participants and invited from moderators if they were there
        // need to delete participants from events of this board if they have been deleted

        const participants = req.body.participants.map(p => new objectId(p.id));
        board.participants = participants;
        board.moderators = req.body.moderators.map(p => new objectId(p.id));
        board.invited = req.body.invited.map(i => new objectId(i.id));

        board.save((err) => {
            if (err) {
                return res.status(err.status).json(err);
            }

            return res.status(200).send();
        });
    });

};

module.exports.accept = function(req, res) {

    if (Object.keys(req.body).length === 0) {
        return res.sendStatus(400).send();
    }

    if (!/^([0-9a-fA-F]{12}|[0-9a-fA-F]{24})$/.test(req.body.id)) {
        return res.status(400).send();
    }

    Board.findOne({ _id: new objectId(req.body.id) }, (err, board) => {

        if (err) {
            return res.status(err.status).json(err);
        }

        if (!board) {
            return res.status(404).send();
        }

        const invitedId = board.invited.find(i => i.equals(req.payload._id));

        if (!invitedId) {
            return res.status(403).json({
                message: 'You are not invited!'
            });
        }

        board.invited = board.invited.filter(i => !i.equals(invitedId));
        board.participants = [...board.participants, invitedId];

        board.save((err) => {
            if (err) {
                return res.status(err.status).json(err);
            }

            return res.status(200).send();
        });
    });
};

module.exports.enter = function(req, res) {

    if (Object.keys(req.body).length === 0) {
        return res.sendStatus(400).send();
    }

    if (!/^([0-9a-fA-F]{12}|[0-9a-fA-F]{24})$/.test(req.body.id)) {
        return res.status(400).send();
    }

    Board.findOne({ _id: new objectId(req.body.id) }, (err, board) => {

        if (err) {
            return res.status(err.status).json(err);
        }

        if (!board) {
            return res.status(404).send();
        }
        console.log(board);

        if (board.isPrivate) {
            return res.status(403).json({
                message: 'It is private board. You are not invited!'
            });
        }

        board.participants = [...board.participants, req.payload._id];

        board.save((err) => {
            if (err) {
                return res.status(err.status).json(err);
            }

            return res.status(200).send();
        });
    });
};

module.exports.decline = function(req, res) {

    if (Object.keys(req.body).length === 0) {
        return res.sendStatus(400).send();
    }

    if (!/^([0-9a-fA-F]{12}|[0-9a-fA-F]{24})$/.test(req.body.id)) {
        return res.status(400).send();
    }

    Board.findOne({ _id: new objectId(req.body.id) }, (err, board) => {

        if (err) {
            return res.status(err.status).json(err);
        }

        if (!board) {
            return res.status(404).send();
        }

        const invitedId = board.invited.find(i => i.equals(req.payload._id));

        if (!invitedId) {
            return res.status(403).json({
                message: 'You are not invited!'
            });
        }

        board.invited = board.invited.filter(i => !i.equals(invitedId));

        board.save((err) => {
            if (err) {
                return res.status(err.status).json(err);
            }

            return res.status(200).send();
        });
    });
};

module.exports.getEvents = function(req, res) {

    const id = req.params.id;

    if (!/^([0-9a-fA-F]{12}|[0-9a-fA-F]{24})$/.test(id)) {
        return res.status(400).send();
    }

    let aggregate = [
        {
            $match: {
                'timeFrom': { $gte: new Date(req.query.from) },
                'timeTo': { $lt: new Date(req.query.to) }
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'creator',
                foreignField: '_id',
                as: 'creator'
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'participants',
                foreignField: '_id',
                as: 'participants'
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'invited',
                foreignField: '_id',
                as: 'invited'
            }
        },
        {
            $lookup: {
                from: 'boards',
                localField: 'board',
                foreignField: '_id',
                as: 'board'
            }
        },
        {
            $match: {
                'board._id': { $eq: new objectId(id) }
            }
        }
    ]

    Event.aggregate(aggregate).exec(function(err, events){

        if (err) {
            return res.status(err.status).json(err);
        }

        return res.status(200).json(events);

    });
};

module.exports.leave = function(req, res) {

    if (Object.keys(req.body).length === 0) {
        return res.status(400).send();
    }

    if (!/^([0-9a-fA-F]{12}|[0-9a-fA-F]{24})$/.test(req.params.id)) {
        return res.status(400).send();
    }

    Board.findOne({ _id: new objectId(req.body.id) }, (err, board) => {

        if (err) {
            return res.status(err.status).json(err);
        }

        if (!board) {
            return res.status(404).send();
        }

        const participantId = board.participants.find(i => i.equals(req.payload._id));

        if (!participantId) {
            return res.status(403).json({
                message: 'You are not participant!'
            });
        }

        if (participantId.equals(board.creator)) {
            return res.status(403).json({
                message: 'You are creator. You can not leave this board!'
            });
        }

        board.participants = board.participants.filter(i => !i.equals(participantId));
        board.moderators = board.moderators.filter(i => !i.equals(participantId));

        board.save((err) => {
            if (err) {
                return res.status(err.status).json(err);
            }

            Event.find({ 
                board: board._id,
                participants: { $eq: participantId }
            }, (err, events) => {

                if (err) {
                    return res.status(err.status).json(err);
                }
                
                events.forEach(event => {
                    event.participants = event.participants.filter(i => !i.equals(participantId));

                    event.save((err) => {
                        if (err) {
                            return res.status(err.status).json(err);
                        }
                    });
                });

                return res.status(200).send();
            });
        });
    });
};

module.exports.searchBoards = (req, res) => {

    Board.aggregate([
        {
            $lookup: {
                from: 'events',
                localField: '_id',
                foreignField: 'board',
                as: 'events'
            }
        },
        {
            $match: {
                'name': { $regex : req.query.query, $options: 'i' },
                'isPrivate': { $eq: false }
            }
        }
    ]).exec(function(err, boards){

        if (err) {
            return res.status(err).status(err);
        }

        return res.status(200).json(boards.map(board => ({
            id: board._id,
            name: board.name,
            creator: board.creator,
            events: board.events.length,
            participants: board.participants.length,
            isParticipant: board.participants.some(p => p.equals(req.payload._id))
        })));

    });
}
