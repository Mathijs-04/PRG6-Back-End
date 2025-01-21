import Game from "../schemas/Game.js";
import {Router} from "express";
import {faker} from "@faker-js/faker";

const gamesRouter = new Router();

gamesRouter.options('/', async (req, res) => {
    res.set('Allow', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.status(204).send();
});

gamesRouter.options('/:id', async (req, res) => {
    res.set('Allow', 'GET, PUT, DELETE, OPTIONS');
    res.set('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
    res.status(204).send();
});

gamesRouter.post('/', async (req, res, next) => {
    const {title, description, developer, METHOD, count} = req.body;

    if (METHOD === 'SEED') {
        const count = parseInt(req.body.count, 10);
        if (isNaN(count) || count <= 0) {
            return res.status(400).json({message: "Invalid count parameter"});
        }

        try {
            await Game.deleteMany({});
            for (let i = 0; i < count; i++) {
                let game = new Game({
                    title: faker.commerce.productName(),
                    description: faker.commerce.productDescription(),
                    developer: faker.company.name()
                });
                await game.save();
            }
            res.status(201).json({message: `${count} games seeded`});
        } catch (error) {
            res.status(500).json({error: "An error occurred while seeding games"});
        }
    } else {
        next();
    }
});

gamesRouter.post('/', async (req, res) => {
    const {title, description, developer} = req.body;

    if (!title || !description || !developer) {
        return res.status(400).json({message: "Missing required fields: title, description, developer"});
    }

    try {
        let game = new Game({title, description, developer});
        await game.save();
        res.status(201).json(game);
    } catch (error) {
        res.status(500).json({error: "An error occurred while creating the game"});
    }
});

gamesRouter.get('/', async (req, res) => {
    let pagination = {};
    let games = [];

    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;

        if (page < 1 || limit < 1) {
            return res.status(422).json({error: "Page and limit should be numbers greater than 0"});
        }

        const totalItems = await Game.countDocuments();
        const totalPages = Math.ceil(totalItems / limit);

        games = await Game.find({})
            .skip((page - 1) * limit)
            .limit(limit);

        pagination = {
            currentPage: page,
            currentItems: games.length,
            totalPages: totalPages,
            totalItems: totalItems,
            _links: {
                first: {
                    page: 1,
                    href: `${process.env.BASE_URL}?page=1&limit=${limit}`
                },
                last: {
                    page: totalPages,
                    href: `${process.env.BASE_URL}?page=${totalPages}&limit=${limit}`
                },
                previous: page > 1 ? {
                    page: page - 1,
                    href: `${process.env.BASE_URL}?page=${page - 1}&limit=${limit}`
                } : null,
                next: page < totalPages ? {
                    page: page + 1,
                    href: `${process.env.BASE_URL}?page=${page + 1}&limit=${limit}`
                } : null
            }
        };
    } catch (error) {
        return res.status(500).json({error: "An error occurred while fetching games"});
    }

    res.status(200).json({
        items: games,
        _links: {
            self: {
                href: `${process.env.BASE_URL}games`
            },
            collection: {
                href: `${process.env.BASE_URL}games`
            }
        },
        pagination: pagination
    });
});

gamesRouter.get('/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const game = await Game.findById(id);
        if (game) {
            res.status(200).json(game);
        } else {
            res.status(404).json({message: `Game ${id} not found`});
        }
    } catch (error) {
        res.status(500).json({error: "An error occurred while fetching the game"});
    }
});

gamesRouter.put('/:id', async (req, res) => {
    const id = req.params.id;
    const {title, description, developer} = req.body;

    if (!title || !description || !developer) {
        return res.status(400).json({message: "Missing required fields: title, description, developer"});
    }

    try {
        let game = await Game.findById(id);
        if (game) {
            game.title = title;
            game.description = description;
            game.developer = developer;
            await game.save();
            res.status(200).json({message: `Game ${id} updated`});
        } else {
            res.status(404).json({message: `Game ${id} not found`});
        }
    } catch (error) {
        res.status(500).json({error: "An error occurred while updating the game"});
    }
});

gamesRouter.delete('/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const result = await Game.deleteOne({_id: id});
        if (result.deletedCount > 0) {
            res.status(204).send();
        } else {
            res.status(404).json({message: `Game ${id} not found`});
        }
    } catch (error) {
        res.status(500).json({error: "An error occurred while deleting the game"});
    }
});

export default gamesRouter;
