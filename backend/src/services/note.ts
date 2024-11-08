import { HTTPException } from "hono/http-exception";
import NoteRepository from "../repositories/notes";

type NoteData = {
  title: string;
  content: string;
};

class NoteService {
  constructor(private noteRepository = new NoteRepository()) {}
  public createNote(noteData: NoteData, userId: number) {
    return this.noteRepository.create(noteData, userId);
  }
  public async getNote(noteId: number, userId: number) {
    if (!userId || userId < 0)
      throw new HTTPException(404, { message: "invalid user id" });

    const note = await this.noteRepository.findById(noteId, userId);

    if (!note) {
      throw new HTTPException(404, { message: "note not found" });
    }
    return note;
  }
  public async getNotes(userId: number, page: number, limit: number) {
    if (!userId || userId < 0)
      throw new HTTPException(404, { message: "invalid user id" });
    if (page < 0 || limit < 0)
      throw new HTTPException(404, { message: "invalid page or limit" });

    const offset = (page - 1) * limit;
    const [totalNotes, notesList] = await Promise.all([
      this.noteRepository.countNotes(userId),
      this.noteRepository.findNotes(userId, limit, offset),
    ]);
    const totalPages = Math.ceil(totalNotes / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return { notesList, totalNotes, totalPages, hasNext, hasPrev };
  }

  public async updateNote(
    noteId: number,
    title: string,
    content: string,
    userId: number,
  ) {
    const note = await this.noteRepository.findById(noteId, userId);
    if (!note) throw new HTTPException(404, { message: "note not found" });

    return this.noteRepository.update(noteId, title, content, userId);
  }
  public async deleteNote(noteId: number, userId: number) {
    if (!userId || userId < 0)
      throw new HTTPException(404, { message: "invalid user id" });

    const note = await this.noteRepository.findById(noteId, userId);
    if (!note) {
      throw new HTTPException(404, { message: "note not found" });
    }
    return await this.noteRepository.delete(noteId, userId);
  }
}

export default NoteService;
