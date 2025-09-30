const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

// Social Features to Compete with AllUp
const posts = [];
const challenges = [];
const achievements = [];
const leaderboards = [];
const workoutSessions = [];

// Social Feed Management
const createPost = (req, res) => {
  const { userId, content, imageUrl, workoutId, type } = req.body;
  
  const post = {
    id: uuidv4(),
    userId,
    content,
    imageUrl,
    workoutId,
    type, // 'workout', 'achievement', 'progress', 'general'
    likes: [],
    comments: [],
    createdAt: new Date().toISOString(),
    isPublic: true
  };
  
  posts.push(post);
  
  // Auto-generate achievement if milestone reached
  checkAchievements(userId, type);
  
  res.status(201).json({ post });
};

// Fitness Challenges
const createChallenge = (req, res) => {
  const { title, description, type, target, duration, branchId } = req.body;
  
  const challenge = {
    id: uuidv4(),
    title,
    description,
    type, // 'steps', 'workouts', 'attendance', 'weight_loss'
    target,
    duration, // days
    branchId,
    participants: [],
    startDate: new Date().toISOString(),
    endDate: moment().add(duration, 'days').toISOString(),
    prizes: {
      first: 'Free personal training session',
      second: 'Gym merchandise',
      third: 'Protein shake voucher'
    },
    status: 'active'
  };
  
  challenges.push(challenge);
  res.status(201).json({ challenge });
};

// Join Challenge
const joinChallenge = (req, res) => {
  const { challengeId, userId } = req.body;
  
  const challenge = challenges.find(c => c.id === challengeId);
  if (!challenge) {
    return res.status(404).json({ error: 'Challenge not found' });
  }
  
  if (challenge.participants.includes(userId)) {
    return res.status(400).json({ error: 'Already participating' });
  }
  
  challenge.participants.push(userId);
  
  // Create leaderboard entry
  leaderboards.push({
    id: uuidv4(),
    challengeId,
    userId,
    score: 0,
    rank: challenge.participants.length,
    lastUpdated: new Date().toISOString()
  });
  
  res.json({ message: 'Successfully joined challenge', challenge });
};

// Update Challenge Progress
const updateChallengeProgress = (req, res) => {
  const { challengeId, userId, progress } = req.body;
  
  const leaderboard = leaderboards.find(l => 
    l.challengeId === challengeId && l.userId === userId
  );
  
  if (!leaderboard) {
    return res.status(404).json({ error: 'Not participating in challenge' });
  }
  
  leaderboard.score += progress;
  leaderboard.lastUpdated = new Date().toISOString();
  
  // Recalculate rankings
  const challengeLeaderboard = leaderboards
    .filter(l => l.challengeId === challengeId)
    .sort((a, b) => b.score - a.score);
  
  challengeLeaderboard.forEach((entry, index) => {
    entry.rank = index + 1;
  });
  
  res.json({ leaderboard: challengeLeaderboard });
};

// Workout Tracking
const logWorkout = (req, res) => {
  const { userId, exercises, duration, caloriesBurned, notes } = req.body;
  
  const workout = {
    id: uuidv4(),
    userId,
    exercises,
    duration, // minutes
    caloriesBurned,
    notes,
    date: new Date().toISOString(),
    branchId: req.body.branchId
  };
  
  workoutSessions.push(workout);
  
  // Auto-create social post
  const workoutPost = {
    id: uuidv4(),
    userId,
    content: `Completed ${duration} minute workout! Burned ${caloriesBurned} calories.`,
    type: 'workout',
    workoutId: workout.id,
    likes: [],
    comments: [],
    createdAt: new Date().toISOString(),
    isPublic: true
  };
  
  posts.push(workoutPost);
  
  // Check for achievements
  checkWorkoutAchievements(userId);
  
  res.status(201).json({ workout, post: workoutPost });
};

// Achievement System
const checkAchievements = (userId, type) => {
  const userPosts = posts.filter(p => p.userId === userId);
  const userWorkouts = workoutSessions.filter(w => w.userId === userId);
  
  const achievementChecks = [
    {
      id: 'first_workout',
      title: 'First Workout',
      description: 'Complete your first workout',
      condition: () => userWorkouts.length === 1,
      badge: 'beginner'
    },
    {
      id: 'workout_streak_7',
      title: '7-Day Streak',
      description: 'Work out for 7 consecutive days',
      condition: () => checkWorkoutStreak(userId, 7),
      badge: 'consistent'
    },
    {
      id: 'social_butterfly',
      title: 'Social Butterfly',
      description: 'Share 10 workout posts',
      condition: () => userPosts.filter(p => p.type === 'workout').length >= 10,
      badge: 'social'
    },
    {
      id: 'calorie_crusher',
      title: 'Calorie Crusher',
      description: 'Burn 1000+ calories in a single workout',
      condition: () => userWorkouts.some(w => w.caloriesBurned >= 1000),
      badge: 'strength'
    }
  ];
  
  achievementChecks.forEach(check => {
    const existingAchievement = achievements.find(a => 
      a.userId === userId && a.achievementId === check.id
    );
    
    if (!existingAchievement && check.condition()) {
      const achievement = {
        id: uuidv4(),
        userId,
        achievementId: check.id,
        title: check.title,
        description: check.description,
        badge: check.badge,
        unlockedAt: new Date().toISOString()
      };
      
      achievements.push(achievement);
      
      // Create achievement post
      const achievementPost = {
        id: uuidv4(),
        userId,
        content: `Achievement unlocked: ${check.title}! ${check.description}`,
        type: 'achievement',
        achievementId: achievement.id,
        likes: [],
        comments: [],
        createdAt: new Date().toISOString(),
        isPublic: true
      };
      
      posts.push(achievementPost);
    }
  });
};

// Social Feed
const getSocialFeed = (req, res) => {
  const { userId, limit = 20, offset = 0 } = req.query;
  
  // Get posts from user's gym branch
  const user = members.find(m => m.id === userId);
  const branchPosts = posts.filter(p => {
    const postUser = members.find(m => m.id === p.userId);
    return postUser && postUser.branchId === user.branchId;
  });
  
  const feed = branchPosts
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(offset, offset + limit)
    .map(post => {
      const postUser = members.find(m => m.id === post.userId);
      return {
        ...post,
        user: {
          id: postUser.id,
          name: postUser.name,
          avatar: postUser.avatar || null
        },
        likesCount: post.likes.length,
        commentsCount: post.comments.length,
        isLiked: post.likes.includes(userId)
      };
    });
  
  res.json({ feed });
};

// Like Post
const likePost = (req, res) => {
  const { postId, userId } = req.body;
  
  const post = posts.find(p => p.id === postId);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }
  
  const likeIndex = post.likes.indexOf(userId);
  if (likeIndex > -1) {
    post.likes.splice(likeIndex, 1); // Unlike
  } else {
    post.likes.push(userId); // Like
  }
  
  res.json({ 
    postId, 
    likesCount: post.likes.length, 
    isLiked: post.likes.includes(userId) 
  });
};

// Helper Functions
const checkWorkoutStreak = (userId, days) => {
  const userWorkouts = workoutSessions
    .filter(w => w.userId === userId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  
  if (userWorkouts.length < days) return false;
  
  let streak = 0;
  let currentDate = moment();
  
  for (let i = 0; i < days; i++) {
    const workoutOnDate = userWorkouts.find(w => 
      moment(w.date).isSame(currentDate, 'day')
    );
    
    if (workoutOnDate) {
      streak++;
      currentDate = currentDate.subtract(1, 'day');
    } else {
      break;
    }
  }
  
  return streak >= days;
};

const checkWorkoutAchievements = (userId) => {
  checkAchievements(userId, 'workout');
};

module.exports = {
  createPost,
  createChallenge,
  joinChallenge,
  updateChallengeProgress,
  logWorkout,
  getSocialFeed,
  likePost,
  posts,
  challenges,
  achievements,
  workoutSessions
};