import { Expose, plainToClassFromExist } from 'class-transformer';
import { Feed } from '../core/feed';
import { AccountDiscoverFeedResponse, AccountDiscoverFeedResponseUsersItem } from '../responses';

export class AccountDiscoverFeed extends Feed<AccountDiscoverFeedResponse, AccountDiscoverFeedResponseUsersItem> {
  @Expose()
  private nextMaxId: string;

  set state(body: AccountDiscoverFeedResponse) {
    this.moreAvailable = !!body.next_max_id;
    this.nextMaxId = body.next_max_id;
  }

  async request() {
    const { body } = await this.client.request.send<AccountDiscoverFeedResponse>({
      url: `/api/v1/discover/ayml/`,
      method: 'POST',
      form: {
        max_id: this.nextMaxId,
        phone_id: this.client.state.phoneId,
        module: 'discover_people',
        _uuid: this.client.state.uuid,
        _csrftoken: this.client.state.cookieCsrfToken,
        paginate: true,
      },
    });
    this.state = body;
    return body;
  }

  async items() {
    const body = await this.request();
    return body.suggested_users.suggestions.map(user =>
      plainToClassFromExist(new AccountDiscoverFeedResponseUsersItem(this.client), user),
    );
  }
}