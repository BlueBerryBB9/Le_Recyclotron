import { Model } from 'sequelize';
import sequelize from '../config/database.js';
import Category from './Category.js';

class CategoryCategory extends Model {}

CategoryCategory.init({}, {
  sequelize,
  modelName: 'CategoryCategory'
});

Category.belongsToMany(Category, { through: CategoryCategory });
Category.belongsToMany(Category, { through: CategoryCategory });
export default CategoryCategory;