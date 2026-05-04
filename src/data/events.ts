export interface KliPEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  location?: string;
  image?: string;
}

export const kliPEvents: KliPEvent[] = [
  {
    id: 'gov-his-shoulder',
    date: 'November 21, 2025',
    title: 'The Government of His Shoulder',
    description: 'Kingdom Leaders Virtual Meeting featuring Akande B. James (Guest Speaker), Oreoluwa Salami (Convener), and Sophia Oma-benedi (Moderator).',
    location: 'Google Meet @ 6:00 PM',
    image: '/images/Klip/model_1.jpg'
  },
  {
    id: 'nuesa-president',
    date: 'Fresher\'s Orientation',
    title: 'Become the NUESA President For One Day',
    description: 'NUESA in collaboration with KLiP. An initiative to raise student leaders by giving them the opportunity to lead for a day.',
    location: 'LT1 Lecture Theatre, GK Campus, Minna @ 10:00 AM',
    image: '/images/Klip/nuesa.png'
  },
  {
    id: 'namtes-president',
    date: '2025/2026 Session',
    title: 'Be the NAMTES President for One Day',
    description: 'National Association of Mechatronics Engineering Students (FUTMINNA Chapter) in collaboration with KINGDOM LEADERS IN POLITICS.',
    location: 'FUTMINNA',
    image: '/images/Klip/namtes.jpg'
  },
  {
    id: 'meritorious-service',
    date: '2025/2026 Orientation',
    title: 'Certificate of Meritorious Service',
    description: 'Awarded to Tolorunse Oluwaseun Israel for successfully discharging the duties of the office of the president for a day.',
    location: 'NAMTES x KLiP',
    image: '/images/Klip/certificate.jpg'
  },
  {
    id: 'klip-community',
    date: 'Ongoing',
    title: 'Join Our Community',
    description: 'Bringing the Kingdom of God to the mountain of Politics and Governance. Raising ministers unto God.',
    location: 'Students\' Leaders in Politics',
    image: '/images/Klip/community.jpg'
  }
];

export const klipValues = ['INSPIRE', 'GROW', 'NURTURE', 'INSTILL', 'TRANSFORM', 'EMPOWER'];

export interface KliPMember {
  name: string;
  role: string;
  img: string;
  link: string;
}

export const klipTeam: KliPMember[] = [
  { name: 'Oreoluwa Salami', role: 'Convener', img: '/images/team/oreoluwa.jpg', link: 'https://www.linkedin.com/in/oreoluwasalami/' },
  { name: 'Saviour Gbolagade', role: 'Team Member', img: '/images/team/savoiur.jpg', link: 'https://facebook.com/saviour.gbolagade/' },
  { name: 'Joel Abundant', role: 'Team Member', img: '/images/team/abundant.jpg', link: 'https://www.linkedin.com/in/abundant-joel-5a8a79277/' },
  { name: 'Ayodele Miracle', role: 'Team Member', img: '/images/team/ayodele.jpg', link: 'https://directory.gsfnational.org/people/miracle-ayodele' },
  { name: 'Akinfenwa Celina', role: 'Team Member', img: '/images/team/celina.jpg', link: 'https://facebook.com/horlluwafummite.akinfenwa.73/' },
  { name: 'Akanmu Deborah', role: 'Team Member', img: '/images/team/deborah.jpg', link: 'https://www.linkedin.com/in/akanmu-deborah-b78a92252/' },
  { name: 'Akinrinde Joel', role: 'Team Member', img: '/images/team/akinrinde.jpg', link: 'https://www.linkedin.com/in/akinrinde-joel' },
  { name: 'Gbaremu Mubarak', role: 'Team Member', img: '/images/team/mubarak.jpg', link: 'https://www.instagram.com/stars_graphix10/' },

];