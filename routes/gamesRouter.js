import Game from "../schemas/Game.js";
import { Router } from "express";
import { faker } from "@faker-js/faker";

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

gamesRouter.post('/seed/:count', async (req, res) => {
    const count = parseInt(req.params.count, 10);
    if (isNaN(count) || count <= 0) {
        return res.status(400).json({ message: "Invalid count parameter" });
    }

    await Game.deleteMany({});
    for (let i = 0; i < count; i++) {
        let game = new Game({
            title: faker.lorem.slug(),
            description: faker.lorem.text(),
            developer: faker.person.fullName()
        });
        await game.save();
    }
    res.status(201).json({ message: `${count} games seeded` });
});

gamesRouter.post('/', async (req, res) => {
    const { title, description, developer } = req.body;

    if (!title || !description || !developer) {
        return res.status(400).json({ message: "Missing required fields: title, description, developer" });
    }

    let game = new Game({ title, description, developer });
    await game.save();
    res.status(201).json(game);
});

gamesRouter.get('/', async (req, res) => {
    const games = await Game.find({});
    res.status(200).json({
        items: games,
        _links: {
            self: {
                href: `${process.env.BASE_URL}games`
            },
            collection: {
                href: `${process.env.BASE_URL}games`
            }
        }
    });
});

gamesRouter.get('/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const game = await Game.findById(id);
        if (game) {
            res.status(200).json(game);
        } else {
            res.status(404).json({ message: `Game ${id} not found` });
        }
    } catch (error) {
        res.status(400).json({ message: "Invalid game ID" });
    }
});

gamesRouter.put('/:id', async (req, res) => {
    const id = req.params.id;
    const { title, description, developer } = req.body;

    if (!title || !description || !developer) {
        return res.status(400).json({ message: "Missing required fields: title, description, developer" });
    }

    try {
        let game = await Game.findById(id);
        if (game) {
            game.title = title;
            game.description = description;
            game.developer = developer;
            await game.save();
            res.status(200).json({ message: `Game ${id} updated` });
        } else {
            res.status(404).json({ message: `Game ${id} not found` });
        }
    } catch (error) {
        res.status(400).json({ message: "Invalid game ID" });
    }
});

gamesRouter.delete('/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const result = await Game.deleteOne({ _id: id });
        if (result.deletedCount > 0) {
            res.status(204).json({ message: `Game ${id} deleted` });
        } else {
            res.status(404).json({ message: `Game ${id} not found` });
        }
    } catch (error) {
        res.status(400).json({ message: "Invalid game ID" });
    }
});

export default gamesRouter;
