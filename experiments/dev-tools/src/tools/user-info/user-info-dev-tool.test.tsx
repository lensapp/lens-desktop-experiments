import { createContainer, type DiContainer } from "@lensapp/injectable";
import { userInfoDevToolFeature } from "./feature";
import { registerFeature } from "@lensapp/feature-core";
import { devToolInjectionToken } from "../../in-general/dev-tool";
import type { RenderResult } from "@testing-library/react";
import { type Discover, discoverFor, selectFor, type Select } from "@lensapp/react-testing-library-discovery";
import { renderFor, type DiRender } from "@lensapp/rendering-test-utils";
import { userInfoDevToolInjectable } from "./user-info-dev-tool.injectable";
import { runAllTestUtilityRunnables } from "@lensapp/test-utils-for-production";
import type { InjectableComponent } from "@lensapp/injectable-react";
import {
  lensIdDecodedTokenInjectionToken,
  lensIdLicenseInjectionToken,
  lensIdLicenseServiceInjectionToken,
  type AccessToken,
} from "@lensapp/lens-id";
import type { License, LicenseService } from "@lensapp/lens-platform-extension-sdk";
import { computed, observable, runInAction } from "mobx";
import type { JSX } from "react";
import { act } from "react";

describe("user-info-dev-tool", () => {
  let di: DiContainer;

  beforeEach(() => {
    di = createContainer("irrelevant");

    registerFeature(di, userInfoDevToolFeature);
    runAllTestUtilityRunnables(di);
  });

  it("is dev tool", () => {
    expect(userInfoDevToolInjectable.injectionToken).toBe(devToolInjectionToken);
  });

  describe("user info button", () => {
    let render: DiRender;
    let rendered: RenderResult;
    let discover: Discover;
    let select: Select;
    let Component: InjectableComponent<() => JSX.Element>;

    beforeEach(async () => {
      render = renderFor(di);
      Component = di.inject(userInfoDevToolInjectable).Component;
    });

    describe("given access token and license exist", () => {
      let featuresBox: ReturnType<typeof observable.box<string[]>>;
      let trialBox: ReturnType<typeof observable.box<boolean>>;
      let expiresAtBox: ReturnType<typeof observable.box<number>>;

      beforeEach(() => {
        featuresBox = observable.box<string[]>([]);
        trialBox = observable.box<boolean>(false);
        expiresAtBox = observable.box<number>(1679145900000);

        di.override(lensIdLicenseInjectionToken, () =>
          computed(
            () =>
              ({
                type: "pro",
                issuedAt: 1647609900000,
                expiresAt: expiresAtBox.get(),
                issuedTo: {
                  givenName: "Bruce",
                  familyName: "Wayne",
                  email: "test@example.com",
                },
                features: featuresBox.get(),
                trial: trialBox.get(),
                issuedBy: { name: "Mirantis" },
                metadata: null,
              }) as License,
          ),
        );
        di.override(lensIdLicenseServiceInjectionToken, () =>
          computed(
            () =>
              ({
                substituteLicenseFeatures: (features: string[]) => {
                  runInAction(() => {
                    featuresBox.set(features);
                  });
                },
                substituteLicenseTrial: (trial: boolean) => {
                  runInAction(() => {
                    trialBox.set(trial);
                  });
                },
                substituteLicenseExpiresAt: (expiresAt: number) => {
                  runInAction(() => {
                    expiresAtBox.set(expiresAt);
                  });
                },
              }) as unknown as LicenseService,
          ),
        );
        di.override(lensIdDecodedTokenInjectionToken, () =>
          computed(
            () =>
              ({
                acr: "1",
                sub: "testuser",
                email: "test@example.com",
                preferred_username: "testuser",
                iss: "Online JWT Builder",
                iat: 1647609900,
                exp: 1679145900,
                aud: "www.example.com",
                given_name: "Bruce",
                family_name: "Wayne",
                license_type: "pro",
                license_iat: 1647609900,
                license_trial: false,
                license_exp: 1679145900,
                license_features: [],
                "allowed-origins": [],
                auth_time: 0,
                azp: "string",
                jti: "some-jti",
                nonce: "some-nonce",
                realm_access: { roles: [] },
                resource_access: { roles: [] },
                scope: "some-scope",
                session_state: "some-session-state",
                typ: "some-typ",
                created_at: "1647609900000",
              }) as AccessToken,
          ),
        );
      });

      describe("when rendered", () => {
        beforeEach(async () => {
          rendered = await render(<Component />);
          discover = discoverFor(() => rendered);
        });

        it("renders", () => {
          expect(rendered.baseElement).toMatchSnapshot();
        });

        it("user info button is rendered", () => {
          expect(discover.querySingleElement("user-info-button").discovered).toBeInTheDocument();
        });

        it("add feature button is rendered", () => {
          expect(discover.querySingleElement("add-feature-button").discovered).toBeInTheDocument();
        });

        it("license trial toggle is rendered", () => {
          expect(discover.querySingleElement("license-trial-toggle").discovered).toBeInTheDocument();
        });

        it("license expiration editor is rendered", () => {
          expect(discover.querySingleElement("license-expiration-editor").discovered).toBeInTheDocument();
        });

        describe("when trial toggle is clicked", () => {
          beforeEach(async () => {
            await act(async () => {
              (discover.getSingleElement("license-trial-toggle").discovered as HTMLInputElement).click();
            });
          });

          it("changes the license trial to true", () => {
            const license = di.inject(lensIdLicenseInjectionToken).get();

            expect(license?.trial).toBe(true);
          });
        });

        it("license features select is rendered", () => {
          expect(discover.querySingleElement("select", "user-info-license-features").discovered).toBeInTheDocument();
        });

        describe("when add feature button is clicked", () => {
          beforeEach(async () => {
            await act(async () => {
              (discover.getSingleElement("add-feature-button").discovered as HTMLElement).click();
            });
          });

          it("shows the new feature input", () => {
            expect(discover.querySingleElement("new-feature-input").discovered).toBeInTheDocument();
          });

          describe("when a feature name is entered and confirmed", () => {
            beforeEach(async () => {
              const input = discover.getSingleElement("new-feature-input");

              await input.type("my-new-feature");
              await discover.getSingleElement("confirm-add-feature-button").click();
            });

            it("adds the new feature to the license", () => {
              const license = di.inject(lensIdLicenseInjectionToken).get();

              expect(license?.features).toContain("my-new-feature");
            });
          });
        });

        describe("when button is clicked", () => {
          beforeEach(async () => {
            await discover.getSingleElement("user-info-button").click();
          });

          it("renders decoded access token", async () => {
            expect(discover.getSingleElement("user-token", "testuser").discovered).toMatchInlineSnapshot(`
<pre
  data-user-token-test="testuser"
>
  {
  "acr": "1",
  "sub": "testuser",
  "email": "test@example.com",
  "preferred_username": "testuser",
  "iss": "Online JWT Builder",
  "iat": 1647609900,
  "exp": 1679145900,
  "aud": "www.example.com",
  "given_name": "Bruce",
  "family_name": "Wayne",
  "license_type": "pro",
  "license_iat": 1647609900,
  "license_trial": false,
  "license_exp": 1679145900,
  "license_features": [],
  "allowed-origins": [],
  "auth_time": 0,
  "azp": "string",
  "jti": "some-jti",
  "nonce": "some-nonce",
  "realm_access": {
    "roles": []
  },
  "resource_access": {
    "roles": []
  },
  "scope": "some-scope",
  "session_state": "some-session-state",
  "typ": "some-typ",
  "created_at": "1647609900000"
}
</pre>
`);
          });
        });
      });
    });

    describe("given access token and license with features exist", () => {
      let featuresBox: ReturnType<typeof observable.box<string[]>>;

      beforeEach(() => {
        featuresBox = observable.box<string[]>(["feature-one", "feature-two"]);

        di.override(lensIdLicenseInjectionToken, () =>
          computed(
            () =>
              ({
                type: "pro",
                issuedAt: 1647609900000,
                expiresAt: 1679145900000,
                issuedTo: {
                  givenName: "Bruce",
                  familyName: "Wayne",
                  email: "test@example.com",
                },
                features: featuresBox.get(),
                trial: false,
                issuedBy: { name: "Mirantis" },
                metadata: null,
              }) as License,
          ),
        );
        di.override(lensIdLicenseServiceInjectionToken, () =>
          computed(
            () =>
              ({
                substituteLicenseFeatures: (features: string[]) => {
                  runInAction(() => {
                    featuresBox.set(features);
                  });
                },
                substituteLicenseTrial: jest.fn(),
                substituteLicenseExpiresAt: jest.fn(),
              }) as unknown as LicenseService,
          ),
        );
        di.override(lensIdDecodedTokenInjectionToken, () =>
          computed(
            () =>
              ({
                acr: "1",
                sub: "testuser",
                email: "test@example.com",
                preferred_username: "testuser",
                iss: "Online JWT Builder",
                iat: 1647609900,
                exp: 1679145900,
                aud: "www.example.com",
                given_name: "Bruce",
                family_name: "Wayne",
                license_type: "pro",
                license_iat: 1647609900,
                license_trial: false,
                license_exp: 1679145900,
                license_features: ["feature-one", "feature-two"],
                "allowed-origins": [],
                auth_time: 0,
                azp: "string",
                jti: "some-jti",
                nonce: "some-nonce",
                realm_access: { roles: [] },
                resource_access: { roles: [] },
                scope: "some-scope",
                session_state: "some-session-state",
                typ: "some-typ",
                created_at: "1647609900000",
              }) as AccessToken,
          ),
        );
      });

      describe("when rendered", () => {
        beforeEach(async () => {
          rendered = await render(<Component />);
          discover = discoverFor(() => rendered);
          select = selectFor(discover);
        });

        describe("when license features select is opened", () => {
          beforeEach(async () => {
            await act(async () => {
              select.openMenu("user-info-license-features");
            });
          });

          it("shows the feature-one option", () => {
            expect(discover.querySingleElement("select-option", "feature-one").discovered).toBeInTheDocument();
          });

          it("shows the feature-two option", () => {
            expect(discover.querySingleElement("select-option", "feature-two").discovered).toBeInTheDocument();
          });

          describe("when a feature checkbox is clicked to toggle off", () => {
            beforeEach(async () => {
              await discover.getSingleElement("select-option-checkbox", "feature-one").click();
            });

            it("removes the feature from selection", () => {
              const license = di.inject(lensIdLicenseInjectionToken).get();

              expect(license?.features).toEqual(["feature-two"]);
            });
          });
        });
      });
    });

    describe("given access token does not exist", () => {
      beforeEach(() => {
        di.override(lensIdDecodedTokenInjectionToken, () => computed(() => undefined));
      });

      describe("when rendered", () => {
        beforeEach(async () => {
          rendered = await render(<Component />);
          discover = discoverFor(() => rendered);
        });

        it("renders", () => {
          expect(rendered.baseElement).toMatchSnapshot();
        });

        it("user info button is not rendered", () => {
          expect(discover.querySingleElement("user-info-button").discovered).not.toBeInTheDocument();
        });
      });
    });
  });
});
