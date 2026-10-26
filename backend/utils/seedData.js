import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import WardrobeItem from '../models/WardrobeItem.js';
import ScrapbookEntry from '../models/ScrapbookEntry.js';
import SkincareProduct from '../models/SkincareProduct.js';
import SkincareRoutineStep from '../models/SkincareRoutineStep.js';
import Workout from '../models/Workout.js';

export const seedInitialData = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('Database already has accounts; skipping seed.');
      return;
    }

    console.log('Seeding demo account and aesthetic lifestyle items for VibeVault...');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    const demoUser = await User.create({
      name: 'Luna Skye',
      email: 'luna@vibevault.app',
      passwordHash,
      preferredMood: 'happy'
    });

    const userId = demoUser._id;

    // Wardrobe items
    await WardrobeItem.create([
      {
        userId,
        name: 'Honey Knit Cropped Cardigan',
        description: 'Cozy butter-yellow handknit cardigan with tortoiseshell buttons.',
        category: 'tops',
        color: 'Butter Yellow',
        season: 'all-season',
        occasion: 'Café & Reading',
        imageUrl: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=700&q=80',
        isFavorite: true
      },
      {
        userId,
        name: 'Sunflowered Linen Midi Dress',
        description: 'Breezy cottagecore midi with gentle sweetheart neckline.',
        category: 'dresses',
        color: 'Ivory & Gold',
        season: 'summer',
        occasion: 'Picnic in the Park',
        imageUrl: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=700&q=80',
        isFavorite: true
      },
      {
        userId,
        name: 'Oatmeal Pleated High-Waist Trousers',
        description: 'Tailored drape trousers in soft brushed linen blend.',
        category: 'bottoms',
        color: 'Oatmeal',
        season: 'fall',
        occasion: 'Studio Work',
        imageUrl: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=700&q=80',
        isFavorite: false
      },
      {
        userId,
        name: 'Vintage Woven Leather Mary Janes',
        description: 'Warm cognac woven leather flats with delicate brass buckles.',
        category: 'footwear',
        color: 'Cognac',
        season: 'spring',
        occasion: 'Weekend Stroll',
        imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=700&q=80',
        isFavorite: true
      }
    ]);

    // Scrapbook entries
    await ScrapbookEntry.create([
      {
        userId,
        title: 'Morning Sunbeams & Lavender Matcha',
        content: 'Woke up before the alarm today. The golden morning light was painting soft amber squares across the kitchen floor. Sipped lavender iced matcha while writing three pages of gratitude.',
        imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
        tags: ['morning ritual', 'matcha', 'peace'],
        entryDate: new Date(),
        isFavorite: true
      },
      {
        userId,
        title: 'Farmers Market Yellow Blooms',
        content: 'Picked up a bundle of baby sunflowers and golden chamomile. The whole studio smells like honey and summer earth. Pressed two little petals into my leather journal.',
        imageUrl: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=800&q=80',
        tags: ['flowers', 'yellow', 'scrapbook'],
        entryDate: new Date(Date.now() - 86400000 * 2),
        isFavorite: true
      }
    ]);

    // Skincare products
    const cleanser = await SkincareProduct.create({
      userId,
      name: 'Gentle Oat Cleansing Balm',
      brand: 'Botanique Pure',
      category: 'cleanser',
      instructions: 'Massage onto dry skin to dissolve SPF and impurities, emulsify with warm water.',
      imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=500&q=80'
    });

    const serum = await SkincareProduct.create({
      userId,
      name: 'Golden Glow Vitamin C & Hyaluronic Elixir',
      brand: 'Aura Glow',
      category: 'serum',
      instructions: 'Press 4 drops gently onto damp face and neck every morning.',
      imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=500&q=80'
    });

    const sunscreen = await SkincareProduct.create({
      userId,
      name: 'Dewy Dew Mineral Sunscreen SPF 50',
      brand: 'Sol Garden',
      category: 'sunscreen',
      instructions: 'Generous two-finger application 15 minutes before stepping into sunshine.',
      imageUrl: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=500&q=80'
    });

    // Routine steps
    await SkincareRoutineStep.create([
      { userId, productId: cleanser._id, name: 'Double Cleanse with Oat Balm', timeOfDay: 'morning', order: 1 },
      { userId, productId: serum._id, name: 'Apply Vitamin C Glow Elixir', timeOfDay: 'morning', order: 2 },
      { userId, productId: sunscreen._id, name: 'Protect with Dewy Sunscreen SPF 50', timeOfDay: 'morning', order: 3 },
      { userId, productId: cleanser._id, name: 'Evening Deep Clarifying Melt', timeOfDay: 'evening', order: 1 },
      { userId, productId: null, name: 'Nourishing Barrier Repair Sleep Mask', timeOfDay: 'evening', order: 2 }
    ]);

    // Workouts
    await Workout.create([
      {
        userId,
        activityName: 'Morning Sunshine Yoga Flow',
        activityType: 'Yoga',
        durationMinutes: 25,
        notes: 'Gentle heart openers and deep breathwork. Felt so open and present.',
        activityDate: new Date(),
        completed: true
      },
      {
        userId,
        activityName: 'Brisk Meadow Walk & Podcast',
        activityType: 'Walking',
        durationMinutes: 40,
        notes: 'Breathed in crisp autumn air while listening to design lectures.',
        activityDate: new Date(Date.now() - 86400000),
        completed: true
      },
      {
        userId,
        activityName: 'Full Body Sculpt Pilates',
        activityType: 'Pilates',
        durationMinutes: 30,
        notes: 'Core focus and slow controlled pulses. Loved the burn!',
        activityDate: new Date(Date.now() - 86400000 * 2),
        completed: true
      }
    ]);

    console.log('✓ VibeVault successfully seeded with demo universe for "luna@vibevault.app" / "password123"');
  } catch (err) {
    console.error('Seeding error:', err);
  }
};
