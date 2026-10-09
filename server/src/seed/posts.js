// hours = how long ago the post was made. kind picks the comment pool used for
// replies that aren't written out explicitly.
module.exports = [
  {
    by: 'meerajoshi', hours: 1, kind: 'travel', images: 1,
    text: 'Mount Bromo at sunrise after a 3 am jeep ride. Ash and smoke everywhere, it honestly looks like another planet. @sofiam you said you wanted to come here someday. #travel #indonesia',
  },
  {
    by: 'ananya', hours: 2, kind: 'photo', images: 3,
    text: 'Golden hour walk along Besant Nagar beach after the last lab of the week. Shot all three on my dad\'s old Pentax. #photography #chennai #filmisnotdead',
    comments: [
      ['danokafor', 'The second one should be framed. Seriously.'],
      ['sneha_k', 'The grain on these is so nice. Which film stock?'],
      ['ananya', '@sneha_k Kodak Gold 200, the cheapest one the shop had!'],
      ['meerajoshi', 'Besant Nagar at sunset never disappoints.'],
      ['kabir', 'Okay I am buying a film camera now. Thanks a lot.'],
    ],
  },
  {
    by: 'arjunv', hours: 3, kind: 'campus', images: 0,
    text: 'Sharing my notes from the ML club workshop on transformers tomorrow. Bring laptops, we are fine-tuning a tiny model on Tamil movie reviews. @ananya @kabir you two promised to come. #machinelearning #campuslife',
  },
  {
    by: 'rohan_m', hours: 4, kind: 'tech', images: 0,
    text: 'Spent the whole afternoon chasing a bug where our payment webhook fired twice. Turns out the retry handler and the queue were both retrying. Idempotency keys are not optional, people. #backend #golang',
    comments: [
      ['vikram_rao', 'This exact question came up in one of my system design interviews.'],
      ['lukasweber', 'Been there. We now store the key with a unique index and treat a duplicate insert as success.'],
      ['rohan_m', '@lukasweber that is pretty much what we ended up doing too.'],
    ],
  },
  {
    by: 'kabir', hours: 5, kind: 'food', images: 2,
    text: 'Finally tried the chole bhature place @meerajoshi kept talking about. Worth the metro ride and the 25 minute queue. #foodie #delhi',
  },
  {
    by: 'sneha_k', hours: 6, kind: 'design', images: 1,
    text: 'New desk setup for the final semester. Tablet, two plants, and a sticky note that says "ship it". #workspace #design',
  },
  {
    by: 'priyanair', hours: 7, kind: 'tech', images: 1,
    text: 'The ESP32 weather station survived a full night on the balcony. Temperature, humidity and pressure going to a tiny dashboard every 5 minutes. Next up: a rain gauge with a 3D printed tipping bucket. #iot #esp32 #makers',
  },
  {
    by: 'vikram_rao', hours: 9, kind: 'campus', images: 0,
    text: 'Placement tip nobody told me in second year: practice explaining your solution out loud. Half my interviews were decided by how clearly I talked through the brute force before optimising. #placements #dsa',
  },
  {
    by: 'emilychen', hours: 10, kind: 'travel', images: 3,
    text: 'Day trip to Niagara with the lab. Loud, misty and completely worth the two hour bus ride. #travel #canada',
  },
  {
    by: 'meerajoshi', hours: 12, kind: 'travel', images: 4,
    text: 'Three days in Udaipur and I still have not seen the whole City Palace. Lake Pichola at sunset is exactly as good as everyone says. #travel #rajasthan #udaipur',
  },
  {
    by: 'sofiam', hours: 14, kind: 'tech', images: 0,
    text: 'Reminder that a div with an onClick is not a button. If it does something, use a real <button> and you get keyboard support and focus handling for free. #a11y #frontend #reactjs',
  },
  {
    by: 'lukasweber', hours: 16, kind: 'tech', images: 0,
    text: 'Our test suite went from 11 minutes to 90 seconds by running against an in-memory database and removing three sleep() calls. Look at your slowest tests first. #testing #opensource',
  },
  {
    by: 'arjunv', hours: 18, kind: 'tech', images: 1,
    text: 'Our crop disease classifier hit 91% on the validation set. Then we tried it on photos from an actual farm and it dropped to 64%. Lesson learned about lab-perfect datasets. #machinelearning #campuslife',
  },
  {
    by: 'danokafor', hours: 20, kind: 'food', images: 1,
    text: 'Week six in Chennai and I have officially lost the jollof vs biryani debate. @ananya took me to a place in Royapettah and I have no defence left. #foodie #chennai',
  },
  {
    by: 'sneha_k', hours: 22, kind: 'design', images: 2,
    text: 'Redid the onboarding screens for our college fest app. Fewer steps, bigger tap targets, and sign ups went up 30% in the first weekend. Small details matter. #uxdesign #figma',
  },
  {
    by: 'ananya', hours: 26, kind: 'campus', images: 0,
    text: 'Does anyone else\'s hostel wifi die exactly five minutes before the assignment portal closes, or is it just ours? #campuslife',
  },
  {
    by: 'emilychen', hours: 27, kind: 'tech', images: 0,
    text: 'Finally understood Raft properly after implementing leader election myself. The paper is readable, but nothing beats watching your own three nodes argue about who is in charge. #distributedsystems #gradschool',
  },
  {
    by: 'danokafor', hours: 29, kind: 'photo', images: 2,
    text: 'Kapaleeshwarar temple during the evening aarti. I have never seen colours like these. #chennai #photography',
  },
  {
    by: 'lukasweber', hours: 31, kind: 'tech', images: 0,
    text: 'Released v2.3 of the little Rust CLI I maintain. 40 contributors now, most of them first-timers. Good first issues with clear steps really do work. #opensource #rustlang',
  },
  {
    by: 'ananya', hours: 34, kind: 'campus', images: 1,
    text: 'Library at 11pm during internals week. Every single table taken. #campuslife #exams',
  },
  {
    by: 'kabir', hours: 40, kind: 'campus', images: 2,
    text: '24 hours, 4 people, one very tired laptop. We built a lost-and-found app for our campus and somehow placed second at the hackathon. Thanks @priyanair for the last minute hardware demo help. #hackathon #campuslife',
  },
  {
    by: 'meerajoshi', hours: 46, kind: 'travel', images: 1,
    text: 'Overnight train from Jaipur to Jaisalmer. Sleeper class, a shared packet of namkeen with a family from Bikaner, and the best sunrise of the year. #travel #indianrailways',
  },
  {
    by: 'rohan_m', hours: 50, kind: 'tech', images: 0,
    text: 'Hot take: most student projects do not need microservices. A well-structured monolith with decent tests will take you very far. #backend #systemdesign',
  },
  {
    by: 'priyanair', hours: 55, kind: 'food', images: 1,
    text: 'Amma sent a box of banana chips and achappam with my cousin. The whole hostel floor smells like Kerala now. #homefood #kerala',
  },
  {
    by: 'vikram_rao', hours: 60, kind: 'campus', images: 0,
    text: 'Got the offer. Eight months of practice, three rejections and one very kind interviewer later. If you are in the middle of placement season right now, keep going. #placements',
  },
  {
    by: 'sofiam', hours: 66, kind: 'travel', images: 2,
    text: 'Sunday morning at the Bunkers del Carmel. Best view of Barcelona, if you can handle the climb. #travel #barcelona',
  },
  {
    by: 'arjunv', hours: 72, kind: 'campus', images: 1,
    text: 'Sunday gully cricket, final score: our team 142, broken windows 1. Collected money for the glass from the whole lane. #cricket #sundays',
  },
  {
    by: 'danokafor', hours: 78, kind: 'campus', images: 0,
    text: 'Things I did not expect in India: how quickly strangers become friends on a train, and how serious people are about filter coffee. @ananya @kabir thanks for the crash course. #exchange #studyabroad',
  },
  {
    by: 'emilychen', hours: 84, kind: 'food', images: 2,
    text: 'Made dumplings from scratch with my lab mates for the mid-autumn festival. Ugly folds, perfect taste. #foodie #toronto',
  },
  {
    by: 'sneha_k', hours: 90, kind: 'design', images: 1,
    text: 'Watercolour study of the Cubbon Park bandstand. Painting outdoors makes you notice how much the light changes in twenty minutes. #art #bengaluru',
  },
  {
    by: 'lukasweber', hours: 96, kind: 'travel', images: 1,
    text: 'Rode 80 km along the Spree this weekend. Legs are gone, mood is excellent. #cycling #berlin',
  },
  {
    by: 'ananya', hours: 102, kind: 'photo', images: 2,
    text: 'Developed my first roll of colour film at the college photo club. Two shots are out of focus and I love them anyway. #photography #filmisnotdead',
  },
  {
    by: 'kabir', hours: 110, kind: 'food', images: 1,
    text: 'Paranthe Wali Gali at 8am. Aloo, gobhi and one experimental banana parantha I will not be ordering again. #foodie #delhi',
  },
  {
    by: 'rohan_m', hours: 118, kind: 'tech', images: 1,
    text: 'We moved from cron scripts to a proper job queue this week. Retries, backoff, and a dashboard that tells you what failed and why. Should have done this months ago. #backend #devops',
  },
  {
    by: 'meerajoshi', hours: 125, kind: 'travel', images: 3,
    text: 'Rann of Kutch on a full moon night. Photos do not do it justice, but these three came close. #travel #gujarat',
  },
  {
    by: 'priyanair', hours: 132, kind: 'tech', images: 0,
    text: 'Spent two hours debugging I2C before realising I had swapped SDA and SCL. Hardware humbles you. #embedded #esp32',
  },
  {
    by: 'vikram_rao', hours: 140, kind: 'tech', images: 0,
    text: 'Explained consistent hashing to my juniors with a pizza and a protractor. Worked better than the whiteboard ever did. #systemdesign #dsa',
  },
  {
    by: 'sofiam', hours: 150, kind: 'tech', images: 1,
    text: 'Gave my first conference talk, on building forms that screen reader users actually enjoy. Nervous for the first five minutes, then it was just a conversation. #a11y #frontend',
  },
  {
    by: 'arjunv', hours: 160, kind: 'tech', images: 0,
    text: 'If your validation accuracy is higher than your training accuracy, check your data split before celebrating. Ask me how I know. #machinelearning',
  },
  {
    by: 'danokafor', hours: 170, kind: 'travel', images: 2,
    text: 'Weekend in Pondicherry with the exchange group. French quarter streets, cycling to the beach, and the best croissant I have had outside Lagos. #travel #pondicherry',
  },
  {
    by: 'emilychen', hours: 180, kind: 'campus', images: 1,
    text: 'First snow of the season, and the CS building is the warmest place on campus. Thesis writing mode activated. #gradschool #toronto',
  },
  {
    by: 'sneha_k', hours: 190, kind: 'design', images: 0,
    text: 'A design system is not a Figma file. It is the agreement your team makes about how things should work, and the file is just where you write it down. #uxdesign #designsystems',
  },
  {
    by: 'kabir', hours: 200, kind: 'campus', images: 1,
    text: 'Our fest stage at 2am, one day before the event. Running on chai and adrenaline. #campuslife #fest',
  },
  {
    by: 'ananya', hours: 215, kind: 'campus', images: 0,
    text: 'Started a small study group for compiler design. Five people, one whiteboard, far too many parse trees. If you are on campus and lost, come to the library at 6. #campuslife #compilers',
  },
  {
    by: 'lukasweber', hours: 230, kind: 'tech', images: 0,
    text: 'Tip for maintainers: a CONTRIBUTING file with a "how to run the tests locally" section will save you about a hundred issue comments a year. #opensource',
  },
  {
    by: 'meerajoshi', hours: 245, kind: 'travel', images: 2,
    text: 'Rishikesh in the off season. Empty ghats, a freezing river, and a cafe that plays old Bollywood songs all day. #travel #uttarakhand',
  },
  {
    by: 'rohan_m', hours: 260, kind: 'food', images: 1,
    text: 'Pune monsoon starter pack: vada pav, cutting chai, and a raincoat that does not work. #monsoon #pune',
  },
  {
    by: 'priyanair', hours: 275, kind: 'campus', images: 1,
    text: 'Electronics lab the night before the project expo. Every bench has at least one smoking resistor story. #campuslife #engineering',
  },
  {
    by: 'vikram_rao', hours: 290, kind: 'campus', images: 0,
    text: 'Mock interview tomorrow with a senior from the 2025 batch. If anyone wants to swap mock interviews this week, I am happy to help. #placements',
  },
  {
    by: 'sofiam', hours: 305, kind: 'food', images: 1,
    text: 'Tried making masala chai from the recipe @priyanair sent me. Two attempts in, getting closer. #chai #learninghindi',
  },
  {
    by: 'arjunv', hours: 320, kind: 'travel', images: 2,
    text: 'Hyderabad old city at night. Charminar lit up and the smell of haleem everywhere. #hyderabad #travel',
  },
  {
    by: 'danokafor', hours: 335, kind: 'campus', images: 0,
    text: 'First week on campus done. Everyone has been incredibly welcoming. Still figuring out the mess timetable though. #exchange #campuslife',
  },
  {
    by: 'emilychen', hours: 350, kind: 'tech', images: 0,
    text: 'Reading group this week: the Dynamo paper. Every time I reread it I find a trade-off I missed. #distributedsystems',
  },
  {
    by: 'sneha_k', hours: 365, kind: 'design', images: 2,
    text: 'Moodboard for a friend\'s cafe rebrand. Terracotta, cream and a lot of hand lettering. #branding #design',
  },
  {
    by: 'kabir', hours: 380, kind: 'tech', images: 0,
    text: 'Learned more about Git in one merge conflict at 3am than in a whole semester of lectures. #git #hackathon',
  },
  {
    by: 'lukasweber', hours: 400, kind: 'travel', images: 1,
    text: 'Autumn in Tiergarten. Best season in Berlin, do not let anyone tell you otherwise. #berlin #autumn',
  },
  {
    by: 'ananya', hours: 420, kind: 'photo', images: 1,
    text: 'Marina at 6am. Fishermen pulling in nets, joggers, and one very curious crow. #photography #chennai',
  },
  {
    by: 'meerajoshi', hours: 440, kind: 'food', images: 2,
    text: 'Dal baati churma in Jaipur, made by my nani. No restaurant comes close. #foodie #rajasthan',
  },
  {
    by: 'vikram_rao', hours: 460, kind: 'tech', images: 0,
    text: 'Sliding window problems finally clicked after I drew them on paper. Sometimes the screen is the problem. #dsa #leetcode',
  },
  {
    by: 'rohan_m', hours: 480, kind: 'campus', images: 1,
    text: 'Last day of internship onboarding. Got my laptop, my access card and 43 Slack channels. #internship',
  },
  {
    by: 'priyanair', hours: 500, kind: 'travel', images: 2,
    text: 'Alleppey backwaters over the long weekend. Houseboat, karimeen fry and zero network. #kerala #travel',
  },
];
