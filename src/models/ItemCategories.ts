import { Model } from 'sequelize';
import sequelize from '../config/database.js';
import Item from './Item.js';
import Category from './Category.js';

class ItemCategory extends Model {}

ItemCategory.init({}, {
  sequelize,
  modelName: 'ItemCategory'
});

Item.belongsToMany(Category, { through: ItemCategory });
Category.belongsToMany(Item, { through: ItemCategory });

export default ItemCategory;