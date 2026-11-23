import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';

export default function DeleteUserForm({
    className = '',
}: {
    className?: string;
}) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef<HTMLInputElement>(null);

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser: FormEventHandler = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);

        clearErrors();
        reset();
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header className="space-y-1">
                <h2 className="text-base font-bold text-rose-600 dark:text-rose-400">
                    Hapus Akun Pengguna
                </h2>

                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Setelah akun Anda dihapus, semua sumber daya dan data profil Anda akan dihapus secara permanen.
                </p>
            </header>

            <DangerButton onClick={confirmUserDeletion}>
                Hapus Akun Ini
            </DangerButton>

            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <form onSubmit={deleteUser} className="p-6 space-y-4">
                    <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                        Apakah Anda yakin ingin menghapus akun Anda?
                    </h2>

                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Setelah akun Anda dihapus, seluruh data profil Anda akan terhapus permanen. Silakan masukkan kata sandi Anda untuk mengonfirmasi.
                    </p>

                    <div className="pt-2">
                        <InputLabel
                            htmlFor="password"
                            value="Kata Sandi Konfirmasi"
                            className="sr-only"
                        />

                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
                            className="mt-1 block w-full sm:w-3/4"
                            isFocused
                            placeholder="Masukkan kata sandi Anda"
                        />

                        <InputError
                            message={errors.password}
                            className="mt-1.5"
                        />
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={closeModal}>
                            Batal
                        </SecondaryButton>

                        <DangerButton disabled={processing}>
                            Ya, Hapus Akun
                        </DangerButton>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
