'use client';
import axios, { AxiosError } from 'axios';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import FormError from '~/app/components/form-error';
import { SmallLoader } from '~/app/components/loader';
import { metadata } from '~/app/constants/metadata';
import { emailRules, requiredRules } from '~/app/constants/validation-rules';
import { friendlyTimeFormat } from '~/app/utils/timeformat';

import { Companies } from '../../components/companies';
import { BorderBeam } from '../../components/magicui/border-beam';
import ShineBorder from '../../components/magicui/shine-border';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { absoluteUrl } from '../../utils/micelane';

interface FormData {
  email: string;
}

interface SignInCodeData {
  signInCode: string;
  time: Date;
}

interface RecoveryLinkData {
  recoveryLink: string;
  time: Date;
}

interface TemporalSignInLinkData {
  temporalSignInLink: string;
  time: Date;
}

interface dataResponse {
  extractedSignInCode: SignInCodeData | null;
  extractedActualizarHogarLink: RecoveryLinkData | null;
  extractedTemporalSignInLink: TemporalSignInLinkData | null;
}

const netflixRequest = absoluteUrl('/netflix/capture');

function DistrinetPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const [showCodeCard, setShowCodeCard] = React.useState<SignInCodeData | null>(
    null
  );
  const [showRecoveryCard, setShowRecoveryCard] =
    React.useState<RecoveryLinkData | null>(null);
  const [showTemporalSigninCard, setShowTemporalSigninCard] =
    React.useState<TemporalSignInLinkData | null>(null);
  const [errorCode, setErrorCode] = React.useState<string | null>(null);
  const [searchedEmail, setSearchedEmail] = React.useState('');
  const [isRequesting, setIsRequesting] = React.useState(false);
  const [attemptCount, setAttemptCount] = React.useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 640);
  }, []);
  const onSubmit = async (data: FormData) => {
    setErrorCode(null);
    setShowCodeCard(null);
    setShowRecoveryCard(null);
    setShowTemporalSigninCard(null);
    setIsRequesting(true);
    const email = data.email.trim();
    if (!email) throw new Error(requiredRules.required);
    setSearchedEmail(email);
    setAttemptCount(0);
    const Attempts = [1000, 1001, 1002];
    for (const delay of Attempts) {
      try {
        setAttemptCount((prev) => prev + 1);
        const response = await axios.post(
          netflixRequest,
          { email },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        if (response.status !== 200 && response.status !== 201)
          throw new Error('Failed to request codes');
        const data: dataResponse = response.data;

        if (
          !data.extractedActualizarHogarLink &&
          !data.extractedSignInCode &&
          !data.extractedTemporalSignInLink
        ) {
          throw new Error('STATUS 3013');
        }
        setShowTemporalSigninCard(data.extractedTemporalSignInLink || null);
        setShowRecoveryCard(data.extractedActualizarHogarLink || null);
        setShowCodeCard(data.extractedSignInCode || null);
        break;
      } catch (error: unknown) {
        const errorMessage =
          error instanceof AxiosError
            ? error.response &&
              error.response.data &&
              error.response.data.message
              ? error.response.data.message
              : error.message
            : error instanceof Error
              ? error.message
              : 'An unknown error occurred';
        if (Attempts.indexOf(delay) === Attempts.length - 1) {
          setErrorCode(errorMessage);
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
    }
    setIsRequesting(false);
  };

  const executeLink = async (link: string) => {
    window.open(link, '_blank');
    setShowRecoveryCard(null);
    setShowCodeCard(null);
    setShowTemporalSigninCard(null);
    setErrorCode(null);
    setSearchedEmail('');
  };

  return (
    <>
      <Companies />
      <section className="space-y-6 pb-8 pt-0 md:pb-12 md:pt-10 lg:py-1 flex flex-col items-center px-4 md:px-0">
        <div>
          <img
            src={`/logos/mec.png`}
            className="h-[15rem]"
            alt={metadata.abreviation}
          />{' '}
        </div>
        <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
          <ShineBorder
            className="text-center capitalize bg-muted px-2 md:px-4 py-1.5 text-sm md:text-lg font-medium absolute mx-4 md:mx-0"
            color={['#6022ff', '#f21a42', '#8cff00']}
          >
            Bienvenido a {metadata.title} ✨
          </ShineBorder>

          <h1 className="font-heading text-3xl sm:text-3xl md:text-4xl lg:text-5xl mt-20">
            El mejor lugar para encontrar tus plataformas streaming favoritas.
          </h1>
          <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
            Ingresa tu correo electronico a continuacion para consultar
            <br />
            <span className="text-[#6022ff] underline">
              Actualizacion de Hogar
            </span>{' '}
            &/o{' '}
            <span className="text-[#6022ff] underline">
              Codigo de inicio de sesion
            </span>{' '}
            <br />
            de <br />
          </p>
        </div>
        <div>
          <img
            src={`/icons/netflix-4.svg`}
            className="h-10 w-40 dark:brightness-0 dark:invert"
            alt={'Netflix'}
          />{' '}
        </div>
        <ShineBorder
          className="text-center capitalize bg-muted max-w-[90vw] lg:max-w-[1600px] min-w-[85%] min-h-[500px] lg:p-12 p-3"
          color={['#6022ff', '#f21a42', '#8cff00']}
          borderWidth={isMobile ? 12 : 53}
          borderRadius={isMobile ? 25 : 40}
        >
          <div className="relative rounded-2xl mx-auto justify-center flex flex-col items-center overflow-hidden p-8 border bg-background w-full">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="w-[90%] relative z-10 rounded-2xl"
            >
              <div className="space-y-4 w-full">
                <label
                  htmlFor="email"
                  className="text-base md:text-lg font-medium block font-bold text-dark dark:text-blue-500"
                >
                  Consulta tus códigos aqui abajo:
                </label>
                <p className="text-[20px] font-bold text-dark dark:text-white text-center">
                  📌 si tu codigo no aparece o esta vencido, recuerda{' '}
                  <span className="text-red-500">REENVIAR </span>
                  la solicitud en tu <br /> dispositivo movil📲 o TV 📺.
                </p>
                <div className="flex flex-col gap-3 md:gap-4 items-stretch md:items-start w-full">
                  <div className="flex-1 w-full">
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      className="h-[5rem] md:h-[5rem] w-full text-base md:text-lg"
                      {...register('email', emailRules)}
                    />
                    <FormError
                      errors={errors}
                      field="email"
                      className="text-sm text-red-500 mt-1"
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    className="h-14 md:h-16 px-8 md:px-12 text-base md:text-lg w-full"
                  >
                    Consultar
                  </Button>
                </div>
              </div>
            </form>
            <div className="mt-8 w-[90%] relative z-10 flex flex-col gap-4 justify-left text-lg font-medium block">
              <p>Resultados de busqueda:</p>
            </div>

            {!isRequesting &&
              !showRecoveryCard?.recoveryLink &&
              !showCodeCard?.signInCode &&
              !errorCode && (
                <div className="mt-8 w-[90%] relative z-10 flex flex-col items-center gap-6 p-8 bg-muted/50 rounded-lg border-2 border-dashed border-primary/30">
                  <div className="text-primary animate-pulse">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="64"
                      height="64"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.3-4.3" />
                    </svg>
                  </div>
                  <p className="text-base md:text-lg font-semibold text-primary text-center">
                    ¡Atent@, aquí saldrán tus resultados de búsqueda!
                  </p>
                </div>
              )}

            {isRequesting && (
              <div className="mt-8 w-[90%] relative z-10 flex flex-col items-center gap-6 p-8 bg-muted/50 rounded-lg border-2 border-dashed border-primary/30">
                <SmallLoader />
                <p className="text-base md:text-lg font-semibold text-primary text-center">
                  buscando coincidencias...{' '}
                  <span>intento {attemptCount}/3</span>
                </p>
              </div>
            )}

            {errorCode &&
              !showRecoveryCard?.recoveryLink &&
              !showCodeCard?.signInCode && (
                <div className="mt-8 w-[90%] relative z-10 bg-red-50 dark:bg-red-950 border-2 border-red-500 rounded-lg p-4 md:p-8 flex flex-col items-center gap-4">
                  <div className="text-red-600 dark:text-red-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="64"
                      height="64"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-red-700 dark:text-red-300">
                    Código no encontrado
                  </h3>
                  <p className="text-sm md:text-base text-center text-red-600 dark:text-red-400 px-2">
                    No se encontró ningún código reciente para{' '}
                    <span className="font-semibold break-all">
                      {searchedEmail}
                    </span>
                  </p>
                  <p className="text-xl md:text-xl text-center text-dark dark:text-white px-2">
                    ⚠️ Asegúrate de haber solicitado el correo primero y espera
                    unos segundos para que llegue.⏳
                  </p>
                  <p className="text-[5px] text-gray-500 absolute left-3 bottom-0">
                    {errorCode}
                  </p>
                </div>
              )}

            {(showRecoveryCard?.recoveryLink ||
              showCodeCard?.signInCode ||
              showTemporalSigninCard?.temporalSignInLink) && (
              <div className="flex flex-col md:flex-row gap-4 md:gap-6 mt-8 w-[90%] relative z-10">
                {showRecoveryCard?.recoveryLink && (
                  <div className="flex-1 bg-blue-50/80 dark:bg-blue-950/80 backdrop-blur-sm border-2 border-blue-500 rounded-lg p-6 flex flex-col items-center gap-4">
                    <div className="text-blue-600 dark:text-blue-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M4 12L12 5l8 7" />
                        <rect x="6" y="12" width="12" height="11" rx="2" />
                      </svg>
                    </div>
                    <p className="text-base text-center font-medium text-blue-700 dark:text-blue-300">
                      Se ha encontrado un enlace para{' '}
                      <span className="text-blue-800 font-bold dark:text-red-400">
                        actualizar tu hogar de netflix.🎉🎉
                      </span>
                    </p>
                    <Button
                      onClick={async () =>
                        await executeLink(showRecoveryCard.recoveryLink)
                      }
                      variant="outline"
                      size="lg"
                      className="h-16 px-12 text-lg border-blue-500 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900"
                    >
                      Actualizar
                    </Button>
                    <p className="text-sm text-center text-blue-600 dark:text-blue-400 px-2">
                      {friendlyTimeFormat(new Date(showRecoveryCard.time))}
                    </p>
                  </div>
                )}

                {showCodeCard?.signInCode && (
                  <div className="flex-1 bg-blue-50/80 dark:bg-blue-950/80 backdrop-blur-sm border-2 border-blue-500 rounded-lg p-6 flex flex-col items-center gap-4">
                    <div className="text-blue-600 dark:text-blue-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="8" r="4" />
                        <path d="M4 20c0-4 16-4 16 0" />
                      </svg>
                    </div>
                    <p className="text-base text-center font-medium text-blue-700 dark:text-blue-300">
                      Se ha encontrado un código de{' '}
                      <span className="text-blue-800 font-bold dark:text-red-400">
                        Inicio de sesion🎉🎉
                      </span>
                      .
                    </p>
                    <p className="text-4xl md:text-5xl font-bold text-blue-800 dark:text-blue-200">
                      {showCodeCard.signInCode ?? ''}
                    </p>
                    <p className="text-sm text-center text-blue-600 dark:text-blue-400 px-2">
                      {friendlyTimeFormat(new Date(showCodeCard.time))}
                    </p>
                  </div>
                )}

                {showTemporalSigninCard?.temporalSignInLink && (
                  <div className="flex-1 bg-blue-50/80 dark:bg-blue-950/80 backdrop-blur-sm border-2 border-blue-500 rounded-lg p-6 flex flex-col items-center gap-4">
                    <div className="text-blue-600 dark:text-blue-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="8" r="4" />
                        <path d="M4 20c0-4 16-4 16 0" />
                      </svg>
                    </div>
                    <p className="text-base text-center font-medium text-blue-700 dark:text-blue-300">
                      Se ha encontrado un enlace para{' '}
                      <span className="text-blue-800 font-bold dark:text-red-400">
                        obtener codigo de inicio temporal de netflix.🎉🎉
                      </span>
                      .
                    </p>
                    <Button
                      onClick={async () =>
                        await executeLink(
                          showTemporalSigninCard.temporalSignInLink
                        )
                      }
                      variant="outline"
                      size="lg"
                      className="h-16 px-12 text-lg border-blue-500 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900"
                    >
                      Obtener codigo
                    </Button>
                    <p className="text-sm text-center text-blue-600 dark:text-blue-400 px-2">
                      {friendlyTimeFormat(
                        new Date(showTemporalSigninCard.time)
                      )}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </ShineBorder>
      </section>
    </>
  );
}

export default DistrinetPage;
