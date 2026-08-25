"use client"

import { ChangeEvent, useEffect, useRef, useState } from 'react'
import { Camera, FolderOpen, ImagePlus, Sparkles } from 'lucide-react'
import DashboardShell from '../_components/shell'

type GroupRow={group_id:string;groups:{name:string}|null}
type Photo={id:string;storage_path:string;caption?:string|null}

export default function PhotosPage(){
 const [groups,setGroups]=useState<GroupRow[]>([]);const [photos,setPhotos]=useState<Photo[]>([]);const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');const inputRef=useRef<HTMLInputElement>(null)
 const groupId=groups[0]?.group_id
 useEffect(()=>{Promise.all([fetch('/api/groups'),fetch('/api/photos')]).then(async([g,p])=>{const gd=await g.json().catch(()=>({}));const pd=await p.json().catch(()=>({}));if(g.ok)setGroups(gd.groups||[]);if(p.ok)setPhotos(pd.photos||[]) }).catch(()=>{})},[])
 async function upload(e:ChangeEvent<HTMLInputElement>){const file=e.target.files?.[0];if(!file||!groupId)return;setBusy(true);setMessage('Uploading…');const fd=new FormData();fd.append('file',file);fd.append('groupId',groupId);fd.append('albumName','Linkup test album');const r=await fetch('/api/photos',{method:'POST',body:fd});const d=await r.json().catch(()=>({}));if(!r.ok)setMessage(d.error||'Upload failed');else{setMessage('Uploaded.');setPhotos([d.photo,...photos])}setBusy(false);e.target.value=''}
 return <DashboardShell title="Photos" eyebrow="KEEP THE MEMORIES">
  <input ref={inputRef} onChange={upload} className="hidden" type="file" accept="image/*" />
  <div className="mb-6 brutal-card bg-brand-blue p-6 sm:p-8"><div className="grid h-11 w-11 place-items-center rounded-lg border-2 border-[#1a1a1a] bg-white"><Camera size={19}/></div><h2 className="mt-4 text-3xl font-black">Put the memories next to the plan.</h2><p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-zinc-700">Pick a photo and Linkup will put it in your crew’s shared album.</p><button disabled={busy||!groupId} onClick={()=>inputRef.current?.click()} className="brutal-btn mt-5 rounded-lg bg-white px-4 py-3 text-sm"><ImagePlus size={16}/> {busy?'Uploading…':'Upload photo'}</button>{message&&<div className="mt-4 inline-flex rounded-lg border-2 border-[#1a1a1a] bg-brand-mint px-3 py-2 text-xs font-black">{message}</div>}</div>
  {photos.length===0?<div className="brutal-card p-10 text-center"><FolderOpen className="mx-auto" size={30}/><h2 className="mt-4 text-2xl font-black">No photos yet.</h2><p className="mt-2 text-sm text-zinc-500">Upload one to create the first album entry.</p></div>:<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{photos.map((photo)=><a key={photo.id} href={`/api/photos/${photo.id}`} className="brutal-card overflow-hidden"><div className="grid aspect-square place-items-center bg-brand-peach"><Camera size={28}/></div><div className="p-4"><div className="text-[10px] font-black tracking-wider text-zinc-400">PHOTO</div><div className="mt-1 truncate text-sm font-black">{photo.caption||photo.storage_path.split('/').pop()}</div></div></a>)}</div>}
  <div className="mt-6 flex items-center gap-3 rounded-xl border-2 border-[#1a1a1a] bg-brand-lemon p-4"><Sparkles size={18}/><p className="text-sm font-black">Google Photos can be tested against this album structure once you create the test album.</p></div>
 </DashboardShell>
}
