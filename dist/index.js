"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const sequelize_1 = require("sequelize");
const dbSetup_1 = __importDefault(require("./dbSetup"));
const constants_1 = require("./constants");
const server = express_1.default();
let models;
server.get("/getfeedback", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { useObj } = models;
        const returnedFeedback = yield useObj.findAll();
        res.json(returnedFeedback);
    }
    catch (error) {
        console.error(error.message);
        res.json(error.message);
    }
}));
server.post("/addfeedback", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { is_useful, route, language, comment } = req.query;
        if (is_useful && route && language) {
            const { useObj } = models;
            const addFeedback = yield useObj.create({
                created_at: new Date(Date.now()),
                is_useful: !!+is_useful,
                route,
                language,
                comment: comment || null,
            });
            res.json(addFeedback);
        }
    }
    catch (error) {
        console.error(error.message);
        res.json(error);
    }
}));
server.get("/getbycategory", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { category, language } = req.query;
        const finalCategory = String(category).trim().toLowerCase();
        if (constants_1.categories.has(category) &&
            constants_1.languages.has(language)) {
            const { orgObj, locObj, servObj } = models;
            const returnedOrgs = yield orgObj.findAll({
                where: {
                    [`categories_${language}`]: { [sequelize_1.Op.contains]: [finalCategory] },
                },
                attributes: [
                    "id",
                    `categories_${language}`,
                    `name_${language}`,
                    `tags_${language}`,
                ],
                include: [
                    {
                        model: locObj,
                        required: false,
                        attributes: ["latitude", "longitude", "city"],
                        through: { attributes: [] },
                        include: [
                            {
                                model: servObj,
                                required: false,
                                attributes: [`name_${language}`],
                                through: { attributes: [] },
                            },
                        ],
                    },
                ],
                order: [[`name_${language}`, "ASC"]],
            });
            res.json(returnedOrgs);
        }
        else {
            throw new Error("language or category parameter is not valid");
        }
    }
    catch (error) {
        console.error(error.message);
        res.json(error);
    }
}));
server.get("/getsinglerecord", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, language } = req.query;
        if (constants_1.languages.has(language)) {
            const { orgObj, locObj, servObj, schObj } = models;
            const returnedOrg = yield orgObj.findOne({
                where: { id },
                attributes: [
                    "id",
                    `name_${language}`,
                    "website",
                    `languages_spoken_${language}`,
                    `customers_served_${language}`,
                    `notes_${language}`,
                    `tags_${language}`,
                ],
                include: [
                    {
                        model: locObj,
                        required: false,
                        through: { attributes: [] },
                        include: [
                            {
                                model: servObj,
                                required: false,
                                attributes: ["id", `name_${language}`],
                                through: { attributes: [] },
                            },
                            {
                                model: schObj,
                                required: false,
                                through: { attributes: [] },
                            },
                        ],
                    },
                ],
            });
            res.json(returnedOrg);
        }
        else {
            throw new Error("language parameter is not valid");
        }
    }
    catch (error) {
        console.error(error.message);
        res.json(error);
    }
}));
server.get("/searchbykeyword", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { query, language } = req.query;
        if (constants_1.languages.has(language)) {
            const { orgObj, locObj } = models;
            const finalQuery = String(query).trim().toLowerCase();
            const returnedOrgs = yield orgObj.findAll({
                where: {
                    [`tags_${language}`]: { [sequelize_1.Op.contains]: [finalQuery] },
                },
                attributes: [
                    "id",
                    `categories_${language}`,
                    `name_${language}`,
                    `tags_${language}`,
                ],
                include: [
                    {
                        model: locObj,
                        attributes: ["latitude", "longitude", "city"],
                        through: { attributes: [] },
                    },
                ],
                order: [[`name_${language}`, "ASC"]],
            });
            res.json(returnedOrgs);
        }
        else {
            throw new Error("language parameter is not valid");
        }
    }
    catch (error) {
        console.error(error.message);
        res.json(error);
    }
}));
server.listen(8000, () => {
    console.log(`Express server up and running`);
    models = dbSetup_1.default();
});
//# sourceMappingURL=index.js.map