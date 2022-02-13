import { generateId } from '@/util/idGenerator';
import { InKinkCategory } from '../types/kinks';
import { Rating } from '../types/ratings';

export const getDefaultRatings = (): Rating[] => [
    { name: 'Not Entered', color: '#FFF' },
    { name: 'Favorite', color: '#6DB5FE' },
    { name: 'Like', color: '#23FD22' },
    { name: 'Okay', color: '#FDFD6B' },
    { name: 'Maybe', color: '#DB6C00' },
    { name: 'No', color: '#920000' },
];

const createKinkCategory = (name: string, subcategories: string[], kinks: string[], defaultRating: string): InKinkCategory => ({
    id: generateId(),
    name,
    subcategories,
    kinks: kinks.map((kinkname) => ({
        id: generateId(),
        name: kinkname,
        ratings: subcategories.reduce((map: Record<string, string>, subcategory: string) => ({ ...map, [subcategory]: defaultRating }), {}),
    })),
});

export const getDefaultKinkContent = (defaultRating: string): InKinkCategory[] => [
    createKinkCategory("Bodies", ["General"], ["Skinny", "Chubby", "Small breasts", "Large breasts", "Small cocks", "Large cocks"], defaultRating),
    createKinkCategory("Clothing", ["Self", "Partner"], ["Clothed sex", "Lingerie", "Stockings", "Heels", "Leather", "Latex", "Uniform / costume", "Cross-dressing"], defaultRating),
    createKinkCategory("Groupings", ["General"], ["You and 1 male", "You and 1 female", "You and trans female", "You and trans male", "You and 1 male, 1 female", "You and 2 males", "You and 2 females", "Orgy"], defaultRating),
    createKinkCategory("General", ["Giving", "Receiving"], ["Romance / Affection", "Handjob / fingering", "Blowjob", "Deep throat", "Swallowing", "Facials", "Cunnilingus", "Face-sitting", "Edging", "Teasing", "JOI, SI"], defaultRating),
    createKinkCategory("Ass play", ["Giving", "Receiving"], ["Anal toys", "Anal sex, pegging", "Rimming", "Double penetration", "Anal fisting"], defaultRating),
    createKinkCategory("Restrictive", ["Self", "Partner"], ["Gag", "Collar", "Leash", "Chastity", "Bondage (Light)", "Bondage (Heavy)", "Encasement"], defaultRating),
    createKinkCategory("Toys", ["Self", "Partner"], ["Dildos", "Plugs", "Vibrators", "Sounding"], defaultRating),
    createKinkCategory("Domination", ["Dominant", "Submissive"], ["Dominant / Submissive", "Domestic servitude", "Slavery", "Pet play", "DD/lg, MD/lb", "Discipline", "Begging", "Forced orgasm", "Orgasm control", "Orgasm denial", "Power exchange"], defaultRating),
    createKinkCategory("No consent", ["Aggressor", "Target"], ["Non-con / rape", "Blackmail / coercion", "Kidnapping", "Drugs / alcohol", "Sleep play"], defaultRating),
    createKinkCategory("Taboo", ["General"], ["Incest", "Age gap", "Interracial / Raceplay", "Bestiality", "Necrophilia", "Cheating", "Exhibitionism", "Voyeurism"], defaultRating),
    createKinkCategory("Surrealism", ["Self", "Partner"], ["Futanari", "Furry", "Vore", "Transformation", "Tentacles", "Monster or Alien"], defaultRating),
    createKinkCategory("Fluids", ["General"], ["Blood", "Watersports", "Scat", "Lactation", "Diapers", "Cum play"], defaultRating),
    createKinkCategory("Degradation", ["Giving", "Receiving"], ["Glory hole", "Name calling", "Humiliation"], defaultRating),
    createKinkCategory("Touch & Stimulation", ["Actor", "Subject"], ["Cock/Pussy worship", "Ass worship", "Foot play", "Tickling", "Sensation play", "Electro stimulation"], defaultRating),
    createKinkCategory("Misc. Fetish", ["Giving", "Receiving"], ["Fisting", "Gangbang", "Breath play", "Impregnation", "Pregnancy", "Feminization", "Cuckold / Cuckquean"], defaultRating),
    createKinkCategory("Pain", ["Giving", "Receiving"], ["Light pain", "Heavy pain", "Nipple clamps", "Clothes pins", "Caning", "Flogging", "Beating", "Spanking", "Cock/Pussy slapping", "Cock/Pussy torture", "Hot Wax", "Scratching", "Biting", "Cutting"], defaultRating),
]