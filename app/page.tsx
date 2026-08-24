const events = [
  { title: 'Beach Day', date: 'Sat, Aug 29', people: '6 going', cost: '$24/person', tag: 'THIS WEEK' },
  { title: 'Camping Trip', date: 'Sep 12–14', people: '8 going', cost: '$68/person', tag: 'PLANNING' },
  { title: 'Movie Night', date: 'Sep 19', people: '5 going', cost: '$15/person', tag: 'IDEA' },
]

const ideas = ['Lake Tahoe weekend', 'Night hike + sunrise', 'Bowling tournament', 'Cook-off at someone’s house']

export default function Home() {
  return <main className="shell">
    <nav className="nav"><div className="brand"><span className="mark">L</span> linkup</div><div className="navlinks"><span className="active">Dashboard</span><span>Events</span><span>Ideas</span><span>Expenses</span><span>Photos</span></div><div className="avatar">R</div></nav>
    <section className="hero"><div><p className="eyebrow">YOUR CREW</p><h1>What’s happening?</h1><p className="sub">Everything your group does, in one place.</p></div><button className="primary">+ New event</button></section>
    <section className="stats"><div><span>UPCOMING</span><strong>3</strong><small>events</small></div><div><span>YOUR BALANCE</span><strong className="green">+$18.50</strong><small>you’re owed</small></div><div><span>IDEAS</span><strong>12</strong><small>to vote on</small></div><div><span>MEMBERS</span><strong>8</strong><small>in your crew</small></div></section>
    <div className="grid"><section className="card events"><div className="cardhead"><div><p className="eyebrow">UP NEXT</p><h2>Events</h2></div><button className="link">View all →</button></div>{events.map((e)=><div className="event" key={e.title}><div className="date"><b>{e.date.split(' ')[1]?.replace('–','')}</b><span>{e.date.split(' ')[0]}</span></div><div className="eventinfo"><span className="tag">{e.tag}</span><h3>{e.title}</h3><p>{e.people} · {e.cost}</p></div><span className="arrow">›</span></div>)}</section>
      <section className="card ideas"><div className="cardhead"><div><p className="eyebrow">BRAIN DUMP</p><h2>Ideas</h2></div><button className="link">All ideas →</button></div><div className="ideaList">{ideas.map((x,i)=><div className="idea" key={x}><span className="ideaNum">0{i+1}</span><span>{x}</span><span className="votes">♡</span></div>)}</div><button className="outline">+ Add an idea</button></section>
    </div>
    <section className="bottom"><div className="card money"><div><p className="eyebrow">MONEY</p><h2>Expenses</h2></div><div className="balances"><div><span>You owe</span><b>$12.50</b><small>to Alex</small></div><div><span>Owed to you</span><b className="green">$31.00</b><small>from 2 people</small></div></div></div><div className="card memory"><p className="eyebrow">RECENT MEMORY</p><div className="photo"><div className="photoOverlay"><b>Beach Day</b><span>18 new photos · yesterday</span></div></div></div></section>
  </main>
}