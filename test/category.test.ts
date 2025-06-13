// import { getCategories } from '../src/controllers/categoryController';
// import { SCategory } from '../src/models/SCategory';


// describe('categoryController', () => {
//     jest.mock('../src/models/SCategory');

//     describe('categoryController', () => {
//         afterEach(() => {
//             jest.clearAllMocks();
//         });

//         it('should return an empty array if no subcategories are found', async () => {
//             (SCategory.findAll as jest.Mock).mockResolvedValueOnce([]);
//             const result = await getCategories(1);
//             expect(result).toEqual([]);
//             expect(SCategory.findAll).toHaveBeenCalledWith({ where: { parentCategoryId: 1 } });
//         });

//         it('should return categories with children recursively', async () => {
//             // Mock data
//             const mockCategory = {
//                 dataValues: { id: 2, name: 'SubCat', parentCategoryId: 1 },
//                 getDataValue: (key: string) => 2,
//             };
//             const mockChildCategory = {
//                 dataValues: { id: 3, name: 'SubSubCat', parentCategoryId: 2 },
//                 getDataValue: (key: string) => 3,
//             };

//             // First call returns one subcategory
//             (SCategory.findAll as jest.Mock)
//                 .mockResolvedValueOnce([mockCategory]) // for parentId: 1
//                 .mockResolvedValueOnce([mockChildCategory]) // for parentId: 2
//                 .mockResolvedValueOnce([]); // for parentId: 3

//             const result = await getCategories(1);

//             expect(result).toEqual([
//                 {
//                     ...mockCategory.dataValues,
//                     children: [
//                         {
//                             ...mockChildCategory.dataValues,
//                             children: [],
//                         },
//                     ],
//                 },
//             ]);
//             expect(SCategory.findAll).toHaveBeenCalledTimes(3);
//         });

//         it('should handle multiple subcategories', async () => {
//             const mockCategory1 = {
//                 dataValues: { id: 2, name: 'SubCat1', parentCategoryId: 1 },
//                 getDataValue: (key: string) => 2,
//             };
//             const mockCategory2 = {
//                 dataValues: { id: 3, name: 'SubCat2', parentCategoryId: 1 },
//                 getDataValue: (key: string) => 3,
//             };

//             (SCategory.findAll as jest.Mock)
//                 .mockResolvedValueOnce([mockCategory1, mockCategory2]) // for parentId: 1
//                 .mockResolvedValueOnce([]) // for parentId: 2
//                 .mockResolvedValueOnce([]); // for parentId: 3

//             const result = await getCategories(1);

//             expect(result).toEqual([
//                 { ...mockCategory1.dataValues, children: [] },
//                 { ...mockCategory2.dataValues, children: [] },
//             ]);
//             expect(SCategory.findAll).toHaveBeenCalledTimes(3);
//         });
//     });
// });
