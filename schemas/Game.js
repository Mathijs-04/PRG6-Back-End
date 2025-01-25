import mongoose from 'mongoose';

const gameSchema = new mongoose.Schema({
    title: {type: String},
    description: {type: String},
    developer: {type: String},
    favorite: {type: Boolean, default: false},
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        versionKey: false,
        transform: (doc, ret) => {

            ret._links = {
                self: {
                    href: `${process.env.BASE_URL}games/${ret._id}`
                },
                collection: {
                    href: `${process.env.BASE_URL}games`
                }
            }

            delete ret._id
        }
    }
});

const Game = mongoose.model('Game', gameSchema);

export default Game;
