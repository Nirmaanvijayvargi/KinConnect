import { openDB } from 'idb';

const DB_NAME = 'kinconnect-meds';
const SCHEDULE_STORE = 'schedules';
const LOG_STORE = 'logs';

const initMedDB = async () => {
    return openDB(DB_NAME, 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(SCHEDULE_STORE)) {
                db.createObjectStore(SCHEDULE_STORE, { keyPath: 'id', autoIncrement: true });
            }
            if (!db.objectStoreNames.contains(LOG_STORE)) {
                const logStore = db.createObjectStore(LOG_STORE, { keyPath: 'id', autoIncrement: true });
                logStore.createIndex('scheduleId', 'scheduleId');
                logStore.createIndex('date', 'date'); // Format YYYY-MM-DD
            }
        },
    });
};

export const addSchedule = async (name, time, days = [0, 1, 2, 3, 4, 5, 6]) => {
    const db = await initMedDB();
    // Default to every day for simplicity in this prototype, or allow custom
    const schedule = {
        name,
        time, // HH:mm format
        days,
        createdAt: new Date().toISOString()
    };
    return db.add(SCHEDULE_STORE, schedule);
};

export const getSchedules = async () => {
    const db = await initMedDB();
    return db.getAll(SCHEDULE_STORE);
};

export const logDose = async (scheduleId) => {
    const db = await initMedDB();
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD localish (UTC really, but consistent)

    // We strive for local date consistency, so:
    const localDateStr = now.toLocaleDateString('en-CA'); // YYYY-MM-DD

    const log = {
        scheduleId,
        timestamp: now.toISOString(),
        date: localDateStr,
        status: 'taken'
    };
    return db.add(LOG_STORE, log);
};

export const getDueMeds = async (simulatedDate) => {
    const db = await initMedDB();
    const now = simulatedDate || new Date();
    const currentDay = now.getDay();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Time window in minutes from start of day
    const currentTimeMinutes = currentHour * 60 + currentMinute;

    const schedules = await db.getAll(SCHEDULE_STORE);
    const dueMeds = [];

    const localDateStr = now.toLocaleDateString('en-CA');

    for (const sch of schedules) {
        if (!sch.days.includes(currentDay)) continue;

        const [h, m] = sch.time.split(':').map(Number);
        const schTimeMinutes = h * 60 + m;

        // Check window (e.g., +/- 60 mins to be safe, or just "is after time and not taken")
        // User asked for +/- 30 mins, or generally "Due".
        // Let's broaden it: If it's *after* the time by up to 2 hours, it's definitely due/overdue.
        // And if it's *before* by 30 mins.

        const diff = currentTimeMinutes - schTimeMinutes;
        const isTime = diff >= -30 && diff <= 120; // 30 mins before, 2 hours after

        if (isTime) {
            // Check if taken
            // Get logs for this date and schedule
            // This is slightly inefficient (getAll then filter), but for N<10 schedules it's fine.
            const logs = await db.getAllFromIndex(LOG_STORE, 'date', localDateStr);
            const taken = logs.some(l => l.scheduleId === sch.id);

            if (!taken) {
                dueMeds.push(sch);
            }
        }
    }

    return dueMeds;
};

// Seed function for demo
export const seedDemoInfo = async () => {
    const db = await initMedDB();
    const count = await db.count(SCHEDULE_STORE);
    if (count === 0) {
        console.log("Seeding Meds...");
        await addSchedule("Aspirin", "09:00");
        await addSchedule("Vitamins", "13:00");
        await addSchedule("Statins", "21:00");
    }
};
