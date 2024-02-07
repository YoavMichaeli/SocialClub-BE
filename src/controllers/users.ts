const userDal = require("../models/dal/user.ts");
const groupDal = require("../models/dal/group.ts");

function deleteUserAccount(userIdToDelete) { 
    userDal.deleteOne(userIdToDelete, (error, result) => {
        if (error){
            return null;
        }
       });

       userDal.getAll((err, users) => {
            users.map(user => {
                if (user.followers.includes(userIdToDelete._id)) {
                    const newUserFollowers = user.followers.filter(userId => userId !== userIdToDelete._id);
                    user.followers = newUserFollowers;
                    
                }
                if (user.following.includes(userIdToDelete._id)) {
                    const newUserFollowing = user.following.filter(userId => userId !== userIdToDelete._id);
                    user.following = newUserFollowing;
                }
                user.save();
            });
       });

       groupDal.getAll((err, groups) => {
        groups.map(group => {
            if (group.followers.includes(userIdToDelete._id)) {
                const newGroupFollowers = group.followers.filter(userId => userId !== userIdToDelete._id);
                group.followers = newGroupFollowers;
                group.friendsNumber--;
                
            }
            group.save();
        });
   });
}

module.exports = {
    deleteUserAccount: deleteUserAccount
};