export type ImportedPerson = {
  name: string;
  phone: string;
  email: string;
  partnerName: string;
};

function parseDelimitedLine(line: string, delimiter: string): string[] {
  const values: string[] = [];
  let value = '';
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (quoted && line[i + 1] === '"') { value += '"'; i += 1; }
      else quoted = !quoted;
    } else if (char === delimiter && !quoted) {
      values.push(value.trim()); value = '';
    } else value += char;
  }
  values.push(value.trim());
  return values;
}

function normalizeHeader(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
}

export function parseParticipantsCsv(contents: string): ImportedPerson[] {
  const clean = contents.replace(/^\uFEFF/, '').trim();
  if (!clean) throw new Error('O arquivo está vazio.');
  const lines = clean.split(/\r?\n/).filter((line) => line.trim());
  const first = lines[0];
  const delimiter = (first.match(/;/g)?.length ?? 0) > (first.match(/,/g)?.length ?? 0) ? ';' : ',';
  const headers = parseDelimitedLine(first, delimiter).map(normalizeHeader);
  const findColumn = (...names: string[]) => headers.findIndex((header) => names.includes(header));
  const nameIndex = findColumn('nome', 'name');
  const phoneIndex = findColumn('telefone', 'celular', 'whatsapp', 'phone');
  const emailIndex = findColumn('e-mail', 'email');
  const partnerIndex = findColumn('casal', 'par', 'parceiro', 'partner');
  if (nameIndex < 0) throw new Error('Não encontrei a coluna Nome. Confira o cabeçalho da planilha.');

  const rows = lines.slice(1).map((line) => parseDelimitedLine(line, delimiter));
  const people = rows.map((row) => ({
    name: (row[nameIndex] ?? '').trim(),
    phone: (phoneIndex >= 0 ? row[phoneIndex] : '')?.replace(/\D/g, '') ?? '',
    email: (emailIndex >= 0 ? row[emailIndex] : '')?.trim().toLowerCase() ?? '',
    partnerName: (partnerIndex >= 0 ? row[partnerIndex] : '')?.trim() ?? '',
  })).filter((person) => person.name);

  if (people.length < 3) throw new Error('A planilha precisa conter pelo menos 3 participantes.');
  if (people.length > 20) throw new Error('O limite é de 20 participantes por grupo.');
  const names = new Set<string>();
  for (const person of people) {
    const key = person.name.toLocaleLowerCase('pt-BR');
    if (names.has(key)) throw new Error(`O nome "${person.name}" aparece mais de uma vez.`);
    names.add(key);
    if (person.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(person.email)) throw new Error(`O e-mail de ${person.name} parece inválido.`);
  }
  for (const person of people) {
    if (person.partnerName && !people.some((candidate) => candidate.name.toLocaleLowerCase('pt-BR') === person.partnerName.toLocaleLowerCase('pt-BR'))) {
      throw new Error(`Não encontrei "${person.partnerName}", indicado como casal de ${person.name}.`);
    }
  }
  for (const person of people) {
    if (!person.partnerName) continue;
    const partner = people.find((candidate) => candidate.name.toLocaleLowerCase('pt-BR') === person.partnerName.toLocaleLowerCase('pt-BR'));
    if (!partner || partner.partnerName.toLocaleLowerCase('pt-BR') !== person.name.toLocaleLowerCase('pt-BR')) {
      throw new Error(`O vínculo de casal entre ${person.name} e ${person.partnerName} precisa estar indicado nos dois sentidos.`);
    }
  }
  return people;
}
