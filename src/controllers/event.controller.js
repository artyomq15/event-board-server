'use strict';

const objectId = require('mongodb').ObjectID;

const Event = require('../domain/Event');
const Board = require('../domain/Board');

module.exports.loadEvents = function(req, res) {

    let userId = req.query.userId;

    if (!/^([0-9a-fA-F]{12}|[0-9a-fA-F]{24})$/.test(userId)) {
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
            $match: {'participants._id': { $eq: new objectId(userId)}}
        }
    ]

    Event.aggregate(aggregate).exec(function(err, events){

        if (err) {
            return res.status(err.status).json(err);
        }

        return res.status(200).json(events);

    });  
};

module.exports.loadEventInvites = function(req, res) {
    let userId = req.query.userId;

    if (!/^([0-9a-fA-F]{12}|[0-9a-fA-F]{24})$/.test(userId)) {
        return res.status(400).send();
    }

    let aggregate = [
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
                'invited._id': { $eq: new objectId(userId)}
            }
        }
    ]

    Event.aggregate(aggregate).exec(function(err, events){

        if (err) {
            return res.status(err.status).json(err);
        }

        return res.status(200).json(events);

    });  
}

module.exports.addEvent = function(req, res) {
    
    if (Object.keys(req.body).length === 0) {
        return res.sendStatus(400).send();
    }

    let event = new Event();
    event.name = req.body.name;
    event.description = req.body.description;
    event.timeFrom = req.body.timeFrom;
    event.timeTo = req.body.timeTo;
    event.participants = req.body.participants.map(p => new objectId(p.id));
    event.invited = req.body.invited.map(i => new objectId(i.id));
    event.creator = new objectId(req.body.creator.id);
    event.color = req.body.color;
    event.board = req.body.board ? new objectId(req.body.board.id) : null;

    event.save((err) => {

        if (err) {
            return res.status(err.status).json(err);
        }

        return res.status(200).send();
    });

};

module.exports.deleteEvent = function(req, res) {

    if (!/^([0-9a-fA-F]{12}|[0-9a-fA-F]{24})$/.test(req.params.id)) {
        return res.status(400).send();
    }

    const id = new objectId(req.params.id);
    const userId = req.payload._id;

    Event.findOne({ _id: id }, (err, event) => {

        if (err) {
            return res.status(err.status).json(err);
        }

        if (!event.board && !event.creator.equals(userId)) {
            return res.status(403).send();
        } else {
            if (event.board) {
                Board.findOne({ _id: event.board }, (err, board) => {
    
                    if (err) {
                        return res.status(err.status).json(err);
                    }
    
                    if (!board.creator.equals(userId) && board.moderators.every((m) => !m.equals(userId))) {
                        return res.status(403).send();
                    }
                });
            }
        }

        Event.deleteOne({ _id: event._id }, (err) => {

            if (err) {
                return res.status(err.status).json(err);
            }

            return res.status(200).send();
        });
    });
};

module.exports.updateEvent = function(req, res) {

    if (Object.keys(req.body).length === 0) {
        return res.sendStatus(400).send();
    }

    if (!/^([0-9a-fA-F]{12}|[0-9a-fA-F]{24})$/.test(req.params.id)) {
        return res.status(400).send();
    }

    const id = new objectId(req.params.id);
    const userId = req.payload._id;

    Event.findOne({ _id: id }, (err, event) => {

        if (err) {
            return res.status(err.status).json(err);
        }

        if (!event.board && !event.creator.equals(userId)) {
            return res.status(403).send();
        } else {
            if (event.board) {
                Board.findOne({ _id: event.board }, (err, board) => {
    
                    if (err) {
                        return res.status(err.status).json(err);
                    }
    
                    if (!board.creator.equals(userId) && board.moderators.every((m) => !m.equals(userId))) {
                        return res.status(403).send();
                    }
                });
            }
        }

        event.name = req.body.name;
        event.description = req.body.description;
        event.timeFrom = new Date(req.body.timeFrom);
        event.timeTo = new Date(req.body.timeTo);
        event.color = req.body.color;

        if (!event.board) {
            event.invited = req.body.invited.map(i => new objectId(i.id));
            // case where user delete creator from participant ? 
            event.participants = req.body.participants.map(p => new objectId(p.id));
        }

        event.save((err) => {
            if (err) {
                return res.status(err.status).json(err);
            }
            return res.status(200).send();
        });
        
    });
        
};
module.exports.deleteParticipant = function(req, res) {
    if (Object.keys(req.body).length === 0) {
        return res.sendStatus(400).send();
    }
    if (!/^([0-9a-fA-F]{12}|[0-9a-fA-F]{24})$/.test(req.params.id)) {
        return res.status(400).send();
    }

    const result = req.body.participants.filter(participant => participant.id !== req.payload._id);
    const id = new objectId(req.body.id);

    const _name = req.body.name;
    const _description = req.body.description;
    const _timeFrom = new Date(req.body.timeFrom);
    const _timeTo = new Date(req.body.timeTo);
    const _color = req.body.color;
    const _creator = new objectId(req.body.creator.id);
    const _participants = result.map(p => new objectId(p.id))

    Event.findOneAndUpdate(
        {_id: id},
        {
            name: _name,
            description: _description,
            timeFrom: _timeFrom,
            timeTo: _timeTo,
            color: _color,
            creator: _creator,
            participants: _participants
        },
        (err) => {
            if (err) {
                return res.status(err.status).json(err);
            }
            return res.status(200).send();
        });

};
module.exports.acceptEvent = function(req, res) {
    if (Object.keys(req.body).length === 0) {
        return res.sendStatus(400).send();
    }
    if (!/^([0-9a-fA-F]{12}|[0-9a-fA-F]{24})$/.test(req.body.id)) {
        return res.status(400).send();
    }

    Event.findOne({ _id: new objectId(req.body.id)}, (err, event) => {

        if (err) {
            return res.status(err.status).json(err);
        }

        const userId = new objectId(req.payload._id);

        const result = event.invited.filter(id => !id.equals(userId));

        event.participants.push(userId);
        event.invited = result;

        event.save((err) => {
            if (err) {
                return res.status(err.status).json(err);
            }
            return res.status(200).send();
        });
    });

};
module.exports.declineEvent = function(req, res) {
    if (Object.keys(req.body).length === 0) {
        return res.sendStatus(400).send();
    }
    if (!/^([0-9a-fA-F]{12}|[0-9a-fA-F]{24})$/.test(req.body.id)) {
        return res.status(400).send();
    }
    Event.findOne({ _id: new objectId(req.body.id)}, (err, event) => {

        if (err) {
            return res.status(err.status).json(err);
        }

        const userId = new objectId(req.payload._id);
        const result = event.invited.filter(id => !id.equals(userId));

        event.invited = result;

        event.save((err) => {
            if (err) {
                return res.status(err.status).json(err);
            }
            return res.status(200).send();
        });
    });

};
module.exports.findCollisions = function(req, res) {

    Event.aggregate([
        { $match: {
                $or: [
                    {
                        'timeFrom': { $gte: new Date(req.query.from) },
                        'timeTo': { $lte: new Date(req.query.to) }
                    },
                    {
                        'timeFrom': { $lte: new Date(req.query.from) },
                        'timeTo': { $gte: new Date(req.query.to) }
                    },
                    {
                        'timeFrom': { $lte: new Date(req.query.from) },
                        'timeTo': { $gte: new Date(req.query.from) },
                    },
                    {
                        'timeFrom': { $lte: new Date(req.query.to) },
                        'timeTo': { $gte: new Date(req.query.to) },
                    },
                ]
            }
        },
        {  $match: {
                $or: [
                    {'invited': { $eq: new objectId(req.query.with)}},
                    {'participants': { $eq: new objectId(req.query.with)}}
                ]
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
                localField: 'creator',
                foreignField: '_id',
                as: 'creator'
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
    ]).exec(function(err, events){
        if (err) {
            return res.status(err.status).json(err);
        }

        return res.status(200)
            .json(events);
    });
};
