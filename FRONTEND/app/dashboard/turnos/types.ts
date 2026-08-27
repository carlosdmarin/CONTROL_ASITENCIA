export type Turno = {
    id: number;
    nombre: string;
    horaInicio: string;
    horaSalida: string;
    createdAt?: string;

};
export type NuevoTurno = Omit<Turno, "id">;