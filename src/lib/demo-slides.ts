import type { Slide } from './types'

export const DEMO_FORM = {
  fellowshipDate: '2026-03-15',
  anchorName: 'Bishal Sunuwar',
  offeringServiceName: 'Sagar Tamang',
  offeringPrayerName: 'Rabin Khadka',
  lastPrayerName: 'Rabin Khadka',
  specialTimeName: 'Youth Team',
  bibleReaderName: 'Milan Rai',
  bibleReaderVerse: 'John 3:16',
  bibleReaderText: 'किनभने परमेश्वरले संसारलाई यति प्रेम गर्नुभयो कि उहाँले आफ्नो एकमात्र पुत्र दिनुभयो, ताकि जो कोही उहाँमाथि विश्वास गर्दछ, नाश हुनेछैन तर अनन्त जीवन पाउनेछ।',
  sermonLeader: 'Pastor Ramesh Shrestha',
  sermonTopicText: 'विश्वास, आशा, र प्रेममा स्थिर रहौं। कठिन समयमा पनि परमेश्वरको वचनमा अडिग रहनु हाम्रो बोलावट हो।',
}

export const DEMO_SONGS = [
  {
    number: '1',
    title: 'यीशु नाम',
    lyricsText: 'पद १:\nयीशु नाम कति मीठो\nयीशु नाम कति प्यारो\nयीशु नाम सुन्दा मेरो\nहृदय आनन्दले भरिन्छ\n\nकोरस:\nहल्लेलुया, हल्लेलुया\nयीशुलाई महिमा होस्\nहल्लेलुया, हल्लेलुया\nउहाँकै नाम उच्च होस्',
  },
]

export const DEMO_WORSHIP_SONGS = [
  {
    number: '1',
    title: 'आराधना गरौं',
    lyricsText: 'पद १:\nआराधना गरौं, प्रभुलाई महिमा दिऔं\nउहाँको प्रेम सधैं अटल छ\n\nकोरस:\nहल्लेलुया, हल्लेलुया\nहाम्रो राजा महान् हुनुहुन्छ',
  },
]

export const DEMO_BIBLE_REFS = [
  {
    ref: 'John 3:16',
    text: 'किनभने परमेश्वरले संसारलाई यति प्रेम गर्नुभयो कि उहाँले आफ्नो एकमात्र पुत्र दिनुभयो, ताकि जो कोही उहाँमाथि विश्वास गर्दछ, नाश हुनेछैन तर अनन्त जीवन पाउनेछ।',
  },
]

export const DEMO_SLIDES: Slide[] = [
  {
    id: 1,
    type: 'welcome',
    title: 'परमेश्वरको घरमा स्वागत छ',
    content: 'आज हामी फेरि एकपटक परमेश्वरको उपस्थितिमा एकत्रित हुन पाएकोमा कृतज्ञ छौं। यहाँ आउनुभएका सबै भाइबहिनीहरूलाई हार्दिक स्वागत छ। परमेश्वरले यो आराधनाको समयलाई आशिषित गर्नुहोस्।',
    subtitle: 'फाल्गुन १७, २०८२',
  },
  {
    id: 2,
    type: 'host',
    title: 'आयोजक',
    content: 'बिशाल सुनुवार',
  },
  {
    id: 3,
    type: 'offering-service',
    title: 'भेटी सेवा',
    content: 'सागर तामाङ',
  },
  {
    id: 4,
    type: 'offering-prayer',
    title: 'भेटीको प्रार्थना',
    content: 'रबिन खड्का',
  },
  {
    id: 5,
    type: 'opening-prayer',
    title: 'आरम्भिक प्रार्थना',
    content: 'हे प्रभु, आजको यो आराधनामा तपाईंको उपस्थिति हामीमाझ हुनुहोस्। हाम्रा हृदयहरूलाई खोलिदिनुहोस् र तपाईंको वचनले हामीलाई परिवर्तन गर्नुहोस्। येशूको नाममा, आमेन।',
  },
  {
    id: 6,
    type: 'lyrics',
    title: 'यीशु नाम',
    subtitle: 'पद १',
    content: 'यीशु नाम कति मीठो\nयीशु नाम कति प्यारो\nयीशु नाम सुन्दा मेरो\nहृदय आनन्दले भरिन्छ',
  },
  {
    id: 7,
    type: 'lyrics',
    title: 'यीशु नाम',
    subtitle: 'कोरस',
    content: 'हल्लेलुया, हल्लेलुया\nयीशुलाई महिमा होस्\nहल्लेलुया, हल्लेलुया\nउहाँकै नाम उच्च होस्',
  },
  {
    id: 8,
    type: 'special-time',
    title: 'स्पेशल समय',
    content: 'युवा टोली',
  },
  {
    id: 9,
    type: 'sermon',
    title: 'बचन',
    subtitle: 'Pastor Ramesh Shrestha',
    content: 'विश्वास, आशा, र प्रेममा स्थिर रहौं। कठिन समयमा पनि परमेश्वरको वचनमा अडिग रहनु हाम्रो बोलावट हो।',
  },
  {
    id: 10,
    type: 'bible',
    title: 'यूहन्ना ३:१६',
    content: 'किनभने परमेश्वरले संसारलाई यति प्रेम गर्नुभयो कि उहाँले आफ्नो एकमात्र पुत्र दिनुभयो, ताकि जो कोही उहाँमाथि विश्वास गर्दछ, नाश हुनेछैन तर अनन्त जीवन पाउनेछ।',
  },
  {
    id: 11,
    type: 'closing-prayer',
    title: 'समापन प्रार्थना',
    content: 'रबिन खड्का',
  },
]
