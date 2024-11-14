import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database.js";

enum ArticleStatus {
    SALABLE = 0,
    UNSALABLE,
    MATERIAL,
    REPARABLE,
    SOLD,
}

class Article extends Model {
    public id!: number;
    public name!: string;
    public status!: ArticleStatus;
}

Article.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: new DataTypes.STRING(128),
            allowNull: false,
        },
        status: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
    },
    {
        tableName: "articles",
        sequelize,
    },
);

export default Article;
