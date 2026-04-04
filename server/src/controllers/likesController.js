import { likeModel } from '../models/likeModel.js';

class LikeController  {
    static async likeUser(req, res, next){
        const { userId } = req.params;
        const { id: likerId } = req.user;
        try {
            if (likerId === parseInt(userId)) {
                return res.status(400).json({ success: false, message: "Vous ne pouvez pas vous liker vous-même" });
            }

            const alreadyLiked = await likeModel.isLiked(likerId, userId);
            if (alreadyLiked) {
                return res.status(400).json({ success: false, message: "Vous avez déjà liké cet utilisateur" });
            }

            const ismatch = await likeModel.isMatch(likerId, userId);
            if (ismatch) {
                return res.status(400).json({ success: false, message: "Vous avez déjà un match avec cet utilisateur" });
            }

            await likeModel.likeUser(likerId, userId);
            const isMatch = await likeModel.isMatch(likerId, userId);
            res.json({ success: true, message: isMatch ? "C'est un match !" : "Utilisateur liké avec succès" });
            
        }catch (err) {
            next(err);
        }
    }
}