// const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema(
//   {
//     profilePic: {
//       type: String,
//       default: "",
//     },
//     name: String,
//     username: String,
//     email: {
//       type: String,
//       unique: true,
//       sparse: true,
//     },
//     password: String,

//     age: Number,
//     gender: String,
//     phone: String,
//     location: {
//       type: String,
//       default: "",
//     },
//     city: {
//       type: String,
//       default: "",
//     },
//     state: {
//       type: String,
//       default: "",
//     },

//     skillsToTeach: [String],
//     skillsToLearn: [String],

//     isProfileComplete: {
//       type: Boolean,
//       default: false,
//     },

//      swappers:[
//   {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//   },
// ],
//   },
//   { timestamps: true }


// );

// // Add indexes for better query performance
// userSchema.index({ isProfileComplete: 1 });
// userSchema.index({ email: 1 });
// userSchema.index({ _id: 1, isProfileComplete: 1 }); // Compound index for getAllUsers query

// module.exports = mongoose.model("User", userSchema);






const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // ================= BASIC INFO =================
    profilePic: {
      type: String,
      default: "",
    },
    name: {
      type: String,
      trim: true,
    },
    username: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },



// ================= MODERATION =================
isBanned: {
  type: Boolean,
  default: false,
},
banUntil: {
  type: Date,
  default: null,
},




    // ================= PERSONAL INFO =================
    age: Number,
    gender: String,
    phone: String,
    location: {
      type: String,
      default: "",
    },
    city: {
      type: String,
      default: "",
    },
    state: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
      maxlength: 500, // Limit bio to 500 characters
    },

    // ================= SKILLS =================
    skillsToTeach: {
      type: [String],
      default: [],
    },
    skillsToLearn: {
      type: [String],
      default: [],
    },

    // ================= MATCHING / SWAP =================
    swappers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // ================= PROFILE STATUS =================
    isProfileComplete: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);



// ================= INDEXES =================
userSchema.index({ email: 1 });
userSchema.index({ isProfileComplete: 1 });
userSchema.index({ _id: 1, isProfileComplete: 1 }); // For getAllUsers query

module.exports = mongoose.model("User", userSchema);
