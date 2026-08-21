import {SavedSignsService} from './saved-signs.service';

describe('SavedSignsService folder compatibility', () => {
  it('keeps a legacy saved sign without folder_id in Sans dossier', () => {
    const service = new SavedSignsService({} as never);

    const sign = service['fromRow']({id: 12, content: 'Ancien panneau', created_at: '2026-08-21T12:00:00.000Z'});

    expect(sign.folderId).toBeNull();
  });

  it('returns a deleted folder’s local cards to Sans dossier', async () => {
    const remove = jasmine.createSpy('remove').and.returnValue({eq: async () => ({error: null})});
    const service = new SavedSignsService({client: {from: () => ({delete: remove})}} as never);
    service.folders.set([{id: 2, name: 'Agriculture', collapsed: false, createdAt: new Date()}]);
    service.signs.set([
      {id: 1, content: 'Dans le dossier', createdAt: new Date(), folderId: 2},
      {id: 2, content: 'Déjà libre', createdAt: new Date(), folderId: null}
    ]);

    const removed = await service.removeFolder(2);

    expect(removed).toBeTrue();
    expect(service.folders()).toEqual([]);
    expect(service.signs().map(sign => sign.folderId)).toEqual([null, null]);
  });
});
