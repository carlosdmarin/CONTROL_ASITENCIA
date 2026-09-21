import ExcelJS from "exceljs";
import { ReporteMensualResponse } from "@/types/reporte";

const OLAMSA_GREEN = "FF0E7A4C";
const OLAMSA_GREEN_LIGHT = "FFE6F6EF";
const SLATE_900 = "FF0F172A";
const SLATE_500 = "FF64748B";
const SLATE_200 = "FFE2E8F0";
const SLATE_100 = "FFF1F5F9";
const SLATE_50 = "FFF8FAFC";

function formatHora(hora?: string | null){ if(!hora) return "—"; return hora.substring(0,5); }
function formatHoras(num?: number | null){ if(num==null) return "—"; const h=Math.floor(num); const m=Math.round((num-h)*60); return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`; }
function formatFechaLarga(fechaStr:string){ try{ const d=new Date(fechaStr+"T00:00:00"); return d.toLocaleDateString("es-ES",{weekday:"long",day:"numeric",month:"long",year:"numeric"});}catch{return fechaStr;}}
function formatFechaCorta(fechaStr:string){ try{ const d=new Date(fechaStr+"T00:00:00"); const dd=String(d.getDate()).padStart(2,"0"); const mm=String(d.getMonth()+1).padStart(2,"0"); return `${dd}/${mm}/${d.getFullYear()}`;}catch{return fechaStr;}}
function getSituacionLabel(s?:string|null){ if(!s||s==="NINGUNA") return "—"; if(s==="TARDANZA_JUSTIFICADA") return "Tard. justificada"; if(s==="SALIDA_ANTICIPADA_JUSTIFICADA") return "Salida anticipada"; if(s==="INASISTENCIA_JUSTIFICADA") return "Inasist. justificada"; return s; }

async function loadImageBase64ForExcel(url:string): Promise<{base64:string;extension:"png"|"jpeg";width:number;height:number}|null>{
  try{ const res=await fetch(url); if(!res.ok) throw new Error(url); const blob=await res.blob(); const dataUrl:string=await new Promise((resolve,reject)=>{ const r=new FileReader(); r.onloadend=()=>resolve(r.result as string); r.onerror=()=>reject(new Error("FileReader")); r.readAsDataURL(blob);}); const m=dataUrl.match(/^data:image\/(png|jpeg|jpg);base64,(.*)$/); if(!m) return null; const ext=m[1]==="jpg"?"jpeg":(m[1] as "png"|"jpeg"); const base64=m[2]; const dims=await new Promise<{w:number;h:number}>(resolve=>{ const img=new Image(); img.onload=()=>resolve({w:img.naturalWidth,h:img.naturalHeight}); img.onerror=()=>resolve({w:200,h:80}); img.src=dataUrl;}); return {base64,extension:ext,width:dims.w,height:dims.h}; } catch(e){ console.warn(e); return null;}
}
const BORDER_THIN={ top:{style:"thin" as const,color:{argb:SLATE_200}}, left:{style:"thin" as const,color:{argb:SLATE_200}}, bottom:{style:"thin" as const,color:{argb:SLATE_200}}, right:{style:"thin" as const,color:{argb:SLATE_200}} };

export async function generarExcelMensual(reporte: ReporteMensualResponse): Promise<Blob>{
  const wb=new ExcelJS.Workbook(); wb.creator="PractiQR"; wb.created=new Date();
  const ws=wb.addWorksheet("Reporte Mensual",{ pageSetup:{paperSize:9,orientation:"landscape",fitToPage:true,fitToWidth:1,fitToHeight:0,margins:{left:0.3,right:0.3,top:0.4,bottom:0.4,header:0.3,footer:0.3}}, properties:{tabColor:{argb:OLAMSA_GREEN}}, headerFooter:{oddFooter:"PractiQR • OLAMSA — Página &P de &N"}});
  ws.columns=[{width:12},{width:12},{width:14},{width:14},{width:14},{width:14},{width:13},{width:20},{width:10}];
  const COLS=9 as const; const cols=(n:number)=>String.fromCharCode(64+n);
  const HEADER_ROWS=5; for(let row=1;row<=HEADER_ROWS;row++){ for(let c=1;c<=COLS;c++){ ws.getCell(row,c).fill={type:"pattern",pattern:"solid",fgColor:{argb:OLAMSA_GREEN_LIGHT}}; }}
  ws.getRow(1).height=22; ws.getRow(2).height=24; ws.getRow(3).height=16; ws.getRow(4).height=14; ws.getRow(5).height=6;
  try{ let img=await loadImageBase64ForExcel("/images/LOGO-C1.png"); if(!img) img=await loadImageBase64ForExcel("/images/LOGO_OLAMSA.png"); if(!img) img=await loadImageBase64ForExcel("/images/logo-olamsa.png"); if(img){ const id=wb.addImage({base64:img.base64,extension:img.extension}); const MAX_W=280,MAX_H=90; let w=img.width,h=img.height; const r=w/h; if(w>MAX_W){w=MAX_W;h=w/r;} if(h>MAX_H){h=MAX_H;w=h*r;} ws.addImage(id,{tl:{col:0.4,row:0.6},ext:{width:w,height:h},editAs:"oneCell"}); }}catch(e){ console.warn(e); }
  ws.mergeCells(`A2:${cols(COLS)}2`); const t=ws.getCell("A2"); t.value="REPORTE MENSUAL DE ASISTENCIA"; t.font={size:16,bold:true,color:{argb:SLATE_900}}; t.alignment={horizontal:"center",vertical:"middle"};
  ws.mergeCells(`A3:${cols(COLS)}3`); const s=ws.getCell("A3"); s.value="Sistema PractiQR"; s.font={size:10,color:{argb:SLATE_500}}; s.alignment={horizontal:"center",vertical:"middle"};
  ws.mergeCells(`A4:${cols(COLS)}4`); const f=ws.getCell("A4"); f.value=`Generado: ${new Date().toLocaleString("es-ES",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"})} (America/Lima)`; f.font={size:8,color:{argb:SLATE_500}}; f.alignment={horizontal:"right",vertical:"middle"};
  let r=HEADER_ROWS+1; for(let c=1;c<=COLS;c++){ ws.getCell(r,c).fill={type:"pattern",pattern:"solid",fgColor:{argb:OLAMSA_GREEN}};} ws.getRow(r).height=3; r++; ws.getRow(r).height=4; r++;
  const sectionHeader=(label:string)=>{ ws.mergeCells(`A${r}:${cols(COLS)}${r}`); const c=ws.getCell(`A${r}`); c.value=label; c.font={size:9,bold:true,color:{argb:SLATE_500}}; c.fill={type:"pattern",pattern:"solid",fgColor:{argb:SLATE_100}}; c.alignment={horizontal:"left",vertical:"middle",indent:1}; for(let c2=1;c2<=COLS;c2++){ ws.getCell(r,c2).border={top:{style:"thin",color:{argb:SLATE_200}},bottom:{style:"thin",color:{argb:SLATE_200}}}; } ws.getRow(r).height=18; r++; };

  sectionHeader("DATOS DEL PRACTICANTE");
  const p=reporte.practicante;
  const addRow9=(l1:string,v1:string,l2:string,v2:string,l3:string,v3:string)=>{ const pairs:[string,string][]=[[l1,v1],[l2,v2],[l3,v3]]; let col=1; for(const [lab,val] of pairs){ ws.getCell(r,col).value=lab; ws.getCell(r,col).font={size:8,bold:true,color:{argb:SLATE_500}}; ws.getCell(r,col).fill={type:"pattern",pattern:"solid",fgColor:{argb:SLATE_50}}; ws.getCell(r,col).alignment={vertical:"middle",indent:1}; ws.getCell(r,col).border=BORDER_THIN; col++; ws.getCell(r,col).value=val; ws.getCell(r,col).font={size:9,color:{argb:SLATE_900}}; ws.getCell(r,col).alignment={vertical:"middle",indent:1}; ws.getCell(r,col).border=BORDER_THIN; col++; ws.getCell(r,col).value=""; ws.getCell(r,col).border=BORDER_THIN; col++; } ws.getRow(r).height=18; r++; };
  addRow9("Practicante",p.nombreCompleto|| "—","DNI",p.documento|| "—","Sede",p.sede|| "—");
  addRow9("Oficina",p.nombreOficina || (p as any).oficina|| "—","Cargo",p.cargo|| "—","Instituto",(p as any).tipoInstituto|| "—");
  addRow9("Estado",p.situacion|| "—","Periodo prácticas",`${p.fechaInicioPracticas|| "—"}${p.fechaFinPracticas?" — "+p.fechaFinPracticas:""}`, "", "");
  ws.getRow(r).height=6; r++;

  sectionHeader("PERIODO DEL REPORTE");
  ws.mergeCells(`A${r}:${cols(COLS)}${r}`); ws.getCell(`A${r}`).value=`${reporte.mesLabel}    •    Tipo: Mensual    •    ${reporte.detalleDiario.length} días`; ws.getCell(`A${r}`).font={size:9,color:{argb:SLATE_900}}; ws.getCell(`A${r}`).alignment={horizontal:"left",vertical:"middle",indent:1}; for(let c=1;c<=COLS;c++) ws.getCell(r,c).border=BORDER_THIN; ws.getRow(r).height=18; r++;
  ws.mergeCells(`A${r}:${cols(COLS)}${r}`); ws.getCell(`A${r}`).value=`${formatFechaLarga(reporte.mesInicio)}  →  ${formatFechaLarga(reporte.mesFin)}`; ws.getCell(`A${r}`).font={size:8,color:{argb:SLATE_500}}; ws.getCell(`A${r}`).alignment={horizontal:"left",vertical:"middle",indent:1}; for(let c=1;c<=COLS;c++) ws.getCell(r,c).border=BORDER_THIN; ws.getRow(r).height=16; r++; ws.getRow(r).height=6; r++;

  sectionHeader("RESUMEN MENSUAL");
  const rs=reporte.resumen;
  const headResumen=["Prog.","Trabaj.","Presentes","Tardanzas","Ausencias","Justif.","Descansos","Cumplimiento"];
  headResumen.forEach((h,i)=>{ const c=ws.getCell(r,i+1); c.value=h; c.font={size:8,bold:true,color:{argb:SLATE_500}}; c.fill={type:"pattern",pattern:"solid",fgColor:{argb:SLATE_50}}; c.alignment={horizontal:"center",vertical:"middle"}; c.border=BORDER_THIN; });
  ws.getCell(r,9).border=BORDER_THIN; ws.getRow(r).height=16; r++;
  const showNA = rs.horasProgramadas==null || Number(rs.horasProgramadas)===0;
  const porcText = showNA ? "N/A" : `${Number(rs.porcentajeCumplimiento).toFixed(1)}%`;
  const valsResumen=[String(rs.diasProgramados),String(rs.diasTrabajados),String(rs.diasPresentes),String(rs.tardanzas),String(rs.ausencias),String(rs.justificaciones),String(rs.descansos),porcText];
  valsResumen.forEach((v,i)=>{ const c=ws.getCell(r,i+1); c.value=v; c.font={size:10,bold:true,color:{argb:SLATE_900}}; c.alignment={horizontal:"center",vertical:"middle"}; c.border=BORDER_THIN; });
  ws.getCell(r,9).border=BORDER_THIN; ws.getRow(r).height=20; r++; ws.getRow(r).height=6; r++;

  sectionHeader("BALANCE DE HORAS");
  ws.mergeCells(`A${r}:C${r}`); ws.getCell(`A${r}`).value="Horas programadas"; ws.getCell(`A${r}`).font={size:8,bold:true,color:{argb:"FFFFFFFF"}}; ws.getCell(`A${r}`).fill={type:"pattern",pattern:"solid",fgColor:{argb:SLATE_900}}; ws.getCell(`A${r}`).alignment={horizontal:"center",vertical:"middle"}; ws.getCell(`A${r}`).border=BORDER_THIN;
  ws.mergeCells(`D${r}:F${r}`); ws.getCell(`D${r}`).value="Horas trabajadas"; ws.getCell(`D${r}`).font={size:8,bold:true,color:{argb:"FFFFFFFF"}}; ws.getCell(`D${r}`).fill={type:"pattern",pattern:"solid",fgColor:{argb:SLATE_900}}; ws.getCell(`D${r}`).alignment={horizontal:"center",vertical:"middle"}; ws.getCell(`D${r}`).border=BORDER_THIN;
  ws.mergeCells(`G${r}:H${r}`); ws.getCell(`G${r}`).value="Balance"; ws.getCell(`G${r}`).font={size:8,bold:true,color:{argb:"FFFFFFFF"}}; ws.getCell(`G${r}`).fill={type:"pattern",pattern:"solid",fgColor:{argb:SLATE_900}}; ws.getCell(`G${r}`).alignment={horizontal:"center",vertical:"middle"}; ws.getCell(`G${r}`).border=BORDER_THIN;
  ws.getCell(`I${r}`).value="Cumplimiento"; ws.getCell(`I${r}`).font={size:8,bold:true,color:{argb:"FFFFFFFF"}}; ws.getCell(`I${r}`).fill={type:"pattern",pattern:"solid",fgColor:{argb:SLATE_900}}; ws.getCell(`I${r}`).alignment={horizontal:"center",vertical:"middle"}; ws.getCell(`I${r}`).border=BORDER_THIN;
  ws.getRow(r).height=18; r++;
  const balanceStr = rs.estadoBalance==="FALTANTES" ? `Faltantes ${formatHoras(rs.horasFaltantes)}` : rs.estadoBalance==="ADICIONALES" ? `Adicionales ${formatHoras(rs.horasAdicionales)}` : "Jornada cumplida";
  const balanceColor = rs.estadoBalance==="FALTANTES" ? "FFDC2626" : rs.estadoBalance==="ADICIONALES" ? "FF16A34A" : SLATE_900;
  const porcBal = showNA ? "N/A" : `${Number(rs.porcentajeCumplimiento).toFixed(1)}%`;
  ws.mergeCells(`A${r}:C${r}`); ws.getCell(`A${r}`).value=showNA?"—":formatHoras(rs.horasProgramadas); ws.getCell(`A${r}`).font={size:10,bold:true,color:{argb:SLATE_900}}; ws.getCell(`A${r}`).alignment={horizontal:"center",vertical:"middle"}; ws.getCell(`A${r}`).border=BORDER_THIN;
  ws.mergeCells(`D${r}:F${r}`); ws.getCell(`D${r}`).value=formatHoras(rs.horasTrabajadas); ws.getCell(`D${r}`).font={size:10,bold:true,color:{argb:SLATE_900}}; ws.getCell(`D${r}`).alignment={horizontal:"center",vertical:"middle"}; ws.getCell(`D${r}`).border=BORDER_THIN;
  ws.mergeCells(`G${r}:H${r}`); ws.getCell(`G${r}`).value=balanceStr; ws.getCell(`G${r}`).font={size:10,bold:true,color:{argb:balanceColor}}; ws.getCell(`G${r}`).alignment={horizontal:"center",vertical:"middle"}; ws.getCell(`G${r}`).border=BORDER_THIN;
  ws.getCell(`I${r}`).value=porcBal; ws.getCell(`I${r}`).font={size:10,bold:true,color:{argb:SLATE_900}}; ws.getCell(`I${r}`).alignment={horizontal:"center",vertical:"middle"}; ws.getCell(`I${r}`).border=BORDER_THIN;
  ws.getRow(r).height=20; r++; ws.getRow(r).height=6; r++;

  sectionHeader(`DETALLE DIARIO — ${reporte.mesLabel.toUpperCase()} (${reporte.detalleDiario.length} DÍAS)`);
  const headDet=["Fecha","Día","Entrada prog.","Entrada real","Salida prog.","Salida real","Estado","Situación","Horas"];
  headDet.forEach((h,i)=>{ const c=ws.getCell(r,i+1); c.value=h; c.font={size:7,bold:true,color:{argb:"FFFFFFFF"}}; c.fill={type:"pattern",pattern:"solid",fgColor:{argb:SLATE_900}}; c.alignment={horizontal:"center",vertical:"middle",wrapText:true}; c.border=BORDER_THIN; });
  ws.getRow(r).height=20; r++;
  const estadoFill:Record<string,string>={ PRESENTE:"FFF0FDF4", TARDANZA:"FFFFFBEB", AUSENTE:"FFFEF2F2", DESCANSO:"FFF1F5F9", JUSTIFICADO:"FFEFF6FF", SIN_MARCAR:"FFF8FAFC" };
  for(const d of reporte.detalleDiario){
    const isDesc=d.esDescanso;
    const vals=[formatFechaCorta(d.fecha), d.diaSemana, isDesc?"—":formatHora(d.horaInicio), isDesc?"—":formatHora(d.asistencia?.entradaReal), isDesc?"—":formatHora(d.horaFin), isDesc?"—":formatHora(d.asistencia?.salidaReal), d.estado, getSituacionLabel(d.situacion), isDesc?"—":formatHoras(d.horasTrabajadas)];
    vals.forEach((v,i)=>{ const c=ws.getCell(r,i+1); c.value=v; c.font={size:8,bold:i===6,color:{argb:SLATE_900}}; if(i===6) c.fill={type:"pattern",pattern:"solid",fgColor:{argb:estadoFill[v?.toUpperCase()||""]||SLATE_50}}; c.alignment={horizontal:"center",vertical:"middle"}; c.border=BORDER_THIN; });
    ws.getRow(r).height=18; r++;
  }
  ws.getRow(r).height=6; r++;

  sectionHeader("INCIDENCIAS MENSUALES");
  if(!reporte.incidencias || reporte.incidencias.length===0){
    ws.mergeCells(`A${r}:${cols(COLS)}${r}`); const c=ws.getCell(`A${r}`); c.value="Sin incidencias registradas."; c.font={size:9,italic:true,color:{argb:"FF94A3B8"}}; c.alignment={vertical:"middle",indent:1}; for(let c2=1;c2<=COLS;c2++) ws.getCell(r,c2).border=BORDER_THIN; ws.getRow(r).height=18; r++;
  } else {
    for(const inc of reporte.incidencias){ ws.mergeCells(`A${r}:${cols(COLS)}${r}`); const c=ws.getCell(`A${r}`); c.value=`• ${inc}`; c.font={size:8,color:{argb:"FF334155"}}; c.alignment={vertical:"middle",wrapText:true,indent:1}; for(let c2=1;c2<=COLS;c2++) ws.getCell(r,c2).border=BORDER_THIN; ws.getRow(r).height=18; r++; }
  }
  ws.getRow(r).height=6; r++;
  r+=1; ws.mergeCells(`A${r}:${cols(COLS)}${r}`); const foot=ws.getCell(`A${r}`); foot.value=`PractiQR • Sistema de Control de Asistencia • OLAMSA    •    Página 1 de 1    •    Generado: ${new Date().toLocaleString("es-ES")}`; foot.font={size:8,color:{argb:"FF94A3B8"}}; foot.alignment={horizontal:"center",vertical:"middle"};
  ws.pageSetup.printArea=`A1:${cols(COLS)}${r}`; ws.views=[{state:"frozen",ySplit:6}];
  const buffer=await wb.xlsx.writeBuffer(); return new Blob([buffer],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
}

export async function descargarExcelMensual(reporte: ReporteMensualResponse){
  const blob=await generarExcelMensual(reporte);
  const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; const dni=reporte.practicante.documento||"sindni"; const fecha=`${reporte.anio}-${String(reporte.mes).padStart(2,"0")}`; a.download=`ReporteMensual_${dni}_${fecha}.xlsx`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}
