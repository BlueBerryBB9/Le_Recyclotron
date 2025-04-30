import { SCategory } from '../src/models/Category'; // Adjust the path to your models
import { createCategory } from '../src/controllers/categoryController'; // Adjust the path to your service or function

jest.mock('../src/models', () => ({
    default: {
        create: jest.fn(),
    },
}));

describe('Category Service Tests', () => {
    describe('createCategory', () => {
        it('should create a new category successfully', async () => {
            const mockCategory = {
                id: 1,
                name: 'Recyclables',
                description: 'Items that can be recycled',
            };

            (c.default.create as jest.Mock).mockResolvedValue(mockCategory);

            const result = await createCategory({
                name: 'Recyclables',
                description: 'Items that can be recycled',
            });

            expect(result).toEqual(mockCategory);
            expect(c.default.create).toHaveBeenCalledWith({
                name: 'Recyclables',
                description: 'Items that can be recycled',
            });
        });

        it('should handle validation errors', async () => {
            try {
                await createCategory({}); // Passing invalid data
            } catch (error) {
                expect(error).toHaveProperty('message', 'Validation error');
            }
        });

        it('should handle database errors', async () => {
            (c.default.create as jest.Mock).mockRejectedValue(new Error('Database error'));

            try {
                await createCategory({
                    name: 'Recyclables',
                    description: 'Items that can be recycled',
                });
            } catch (error) {
                expect(error).toHaveProperty('message', 'Database error');
            }
        });
    });
});
